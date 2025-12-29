import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Customer, Order, Subscription, DiscordConnection } from '../../../../lib/models';
import { addRoleToMember, removeRoleFromMember, isGuildMember, sendDirectMessage } from '../../../../lib/discord';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle checkout session completed (one-time course purchases and subscriptions)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Check if this is a subscription (has subscription field)
    if (session.subscription) {
      // Subscription checkout completed - no additional processing needed
      // The subscription is already active in Stripe
      console.log('✅ Subscription created:', session.subscription);
    }
    
    // Handle one-time course purchases (no subscription)
    const courseId = session.metadata?.courseId;
    const email = session.customer_details?.email;
    const name = session.customer_details?.name || '';
    
    if (courseId && email) {
      await Customer.upsert({ email, full_name: name });

      await Order.create({
        user_id: email,
        course_id: Number(courseId),
        amount: session.amount_total! / 100,
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent as string || null,
        payment_status: 'completed',
        payment_provider: 'stripe',
        customer_email: email,
        customer_name: name
      });
    }
  }

  // Handle subscription updates (status changes)
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    
    try {
      // Update subscription status in database
      await Subscription.updateStatus(subscription.id, subscription.status);
      
      console.log(`✅ Subscription ${subscription.id} status updated to: ${subscription.status}`);

      // Get subscription from database to get customer email
      const dbSubscription = await Subscription.findByStripeId(subscription.id);
      
      if (dbSubscription && dbSubscription.CustomerEmail) {
        // Check if user has Discord connected
        const discordConnection = await DiscordConnection.findByEmail(dbSubscription.CustomerEmail);
        
        if (discordConnection) {
          const guildId = process.env.DISCORD_GUILD_ID;
          const roleId = process.env.DISCORD_MEMBER_ROLE_ID;
          
          if (guildId && roleId) {
            // Check if user is in the server
            const isMember = await isGuildMember(guildId, discordConnection.DiscordUserId);
            
            if (isMember) {
              // Handle active subscription - add role
              if (subscription.status === 'active') {
                const roleAdded = await addRoleToMember(guildId, discordConnection.DiscordUserId, roleId);
                
                if (roleAdded) {
                  console.log(`✅ Discord role added for ${discordConnection.DiscordUsername}`);
                  
                  // Send welcome DM
                  await sendDirectMessage(
                    discordConnection.DiscordUserId,
                    `¡Bienvenido! Tu suscripción a ${dbSubscription.MembershipName} está activa. Ya tienes acceso al servidor de miembros.`
                  );
                } else {
                  console.error(`❌ Failed to add Discord role for ${discordConnection.DiscordUsername}`);
                }
              }
              
              // Handle cancelled/expired subscription - remove role
              if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
                const roleRemoved = await removeRoleFromMember(guildId, discordConnection.DiscordUserId, roleId);
                
                if (roleRemoved) {
                  console.log(`✅ Discord role removed for ${discordConnection.DiscordUsername}`);
                  
                  // Send cancellation DM
                  await sendDirectMessage(
                    discordConnection.DiscordUserId,
                    `Tu suscripción a ${dbSubscription.MembershipName} ha finalizado. Tu rol de miembro ha sido removido. Si deseas renovar, visita nuestro sitio web.`
                  );
                } else {
                  console.error(`❌ Failed to remove Discord role for ${discordConnection.DiscordUsername}`);
                }
              }
            } else {
              console.log(`⚠️ User ${discordConnection.DiscordUserId} is not a member of the guild`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling subscription update:', error);
    }
  }

  return NextResponse.json({ received: true });
}
