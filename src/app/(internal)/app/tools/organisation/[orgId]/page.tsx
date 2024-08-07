
interface OrganisationDetailsPageProps {
  params: {
    orgId: string;
  }
}
export default function OrganisationDetailsPage(props: OrganisationDetailsPageProps) {
  const { params } = props;
  const { orgId } = params;
  return <div>OrganisationDetailsPage, orgId: {orgId}</div>
}