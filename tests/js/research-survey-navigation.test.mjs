import test from 'node:test';
import assert from 'node:assert/strict';
import { clampSurveyStep, navigateSurveySection, syncSurveyStage } from '../../resources/js/lib/surveyNavigation.js';

test('evaluation navigation advances F to G to H and clamps at the last section', () => {
    assert.equal(clampSurveyStep(0 + 1, 3), 1);
    assert.equal(clampSurveyStep(1 + 1, 3), 2);
    assert.equal(clampSurveyStep(2 + 1, 3), 2);
    assert.equal(clampSurveyStep(2 - 1, 3), 1);
    assert.equal(clampSurveyStep(0 - 1, 3), 0);
});

test('section change is immediate and draft persistence is still requested', () => {
    const calls = [];
    const next = navigateSurveySection(2, 3, (step) => calls.push(['step', step]), (step) => calls.push(['save', step]));

    assert.equal(next, 2);
    assert.deepEqual(calls, [['step', 2], ['save', 2]]);
});

test('navigation is a no-op when no sections are provided', () => {
    const calls = [];

    assert.equal(navigateSurveySection(1, 0, (step) => calls.push(step), () => calls.push('save')), null);
    assert.deepEqual(calls, []);
});

test('changing measurement stage replaces stale answer codes and clears stage errors', () => {
    let currentData = { answers: { A01: 'initial response' }, notApplicable: ['E02'] };
    let errorsCleared = 0;
    const changed = syncSurveyStage(
        'evaluation',
        'initial',
        { F01: '4', G01: '5' },
        [],
        (data) => { currentData = data; },
        () => { errorsCleared += 1; },
    );

    assert.equal(changed, true);
    assert.deepEqual(currentData, { answers: { F01: '4', G01: '5' }, notApplicable: [] });
    assert.equal(errorsCleared, 1);
});

test('same-stage server updates do not overwrite unsaved answers', () => {
    let currentData = { answers: { F01: 'unsaved edit' }, notApplicable: [] };
    let errorsCleared = 0;
    const changed = syncSurveyStage(
        'evaluation',
        'evaluation',
        { F01: 'previous saved value' },
        [],
        (data) => { currentData = data; },
        () => { errorsCleared += 1; },
    );

    assert.equal(changed, false);
    assert.deepEqual(currentData, { answers: { F01: 'unsaved edit' }, notApplicable: [] });
    assert.equal(errorsCleared, 0);
});
