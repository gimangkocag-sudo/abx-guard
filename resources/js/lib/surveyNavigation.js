export function clampSurveyStep(index, sectionCount) {
    if (sectionCount < 1) return null;
    return Math.max(0, Math.min(index, sectionCount - 1));
}

/** Hydrate a new measurement stage without discarding edits within the same stage. */
export function syncSurveyStage(stage, previousStage, answers, notApplicable, setData, clearErrors) {
    if (stage === previousStage) return false;

    setData({ answers, notApplicable });
    clearErrors();

    return true;
}

/** Move the visible section immediately while persisting the current draft. */
export function navigateSurveySection(index, sectionCount, setStep, saveDraft) {
    const nextStep = clampSurveyStep(index, sectionCount);
    if (nextStep === null) return null;

    setStep(nextStep);
    saveDraft(nextStep);

    return nextStep;
}
