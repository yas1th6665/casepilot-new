import { useMemo } from "react";
import { useCaseStore } from "../stores/caseStore";
import { useHearingStore } from "../stores/hearingStore";
import { useTaskStore } from "../stores/taskStore";

export function useCaseData(caseNumber) {
  const { cases } = useCaseStore();
  const { hearings } = useHearingStore();
  const { tasks } = useTaskStore();

  return useMemo(() => {
    const selectedCase = cases.find((item) => item.case_number === caseNumber) || null;
    return {
      caseItem: selectedCase,
      hearings: hearings.filter((item) => item.case_number === caseNumber),
      tasks: tasks.filter((item) => item.case_number === caseNumber)
    };
  }, [caseNumber, cases, hearings, tasks]);
}
