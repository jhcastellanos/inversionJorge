import MemberOneOnOnePanel from '../../components/oneOnOne/MemberOneOnOnePanel';

type PageProps = {
  searchParams?: { pay?: string; pick?: string; success?: string };
};

export default function ReunionOneOnOnePage({ searchParams }: PageProps) {
  const payId = searchParams?.pay ? Number.parseInt(searchParams.pay, 10) : null;
  const pickId = searchParams?.pick ? Number.parseInt(searchParams.pick, 10) : null;

  return (
    <MemberOneOnOnePanel
      initialPayId={Number.isFinite(payId!) ? payId : null}
      initialPickId={Number.isFinite(pickId!) ? pickId : null}
    />
  );
}