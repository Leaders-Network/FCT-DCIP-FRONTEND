import SurveyAssessmentReportPage from "@/components/surveyor/SurveyAssessmentReportPage";

interface SurveyAssessmentReportRouteProps {
  params: {
    id: string;
  };
}

export default function SurveyAssessmentReportRoute({
  params,
}: SurveyAssessmentReportRouteProps) {
  return <SurveyAssessmentReportPage assignmentId={params.id} />;
}
