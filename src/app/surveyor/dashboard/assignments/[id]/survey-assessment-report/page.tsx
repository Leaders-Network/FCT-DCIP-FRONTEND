import SurveyAssessmentReportPage from "@/components/surveyor/SurveyAssessmentReportPage";

interface SurveyAssessmentReportRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SurveyAssessmentReportRoute({
  params,
}: SurveyAssessmentReportRouteProps) {
  const { id } = await params;
  return <SurveyAssessmentReportPage assignmentId={id} />;
}
