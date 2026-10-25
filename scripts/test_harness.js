/**
 * TagSci G11 WebApp - Automated In-Browser Runtime Test Harness
 */
(function() {
  const testResults = {
    passed: false,
    assertions: [],
    errors: [],
    logs: []
  };

  function sendLog(msg) {
    testResults.logs.push(msg);
    console.log('[HARNESS]', msg);
    try {
      fetch('/__log', { method: 'POST', body: msg }).catch(() => {});
    } catch(e) {}
  }

  function assert(name, condition, details) {
    const ok = Boolean(condition);
    testResults.assertions.push({ name, passed: ok, details: details || '' });
    sendLog((ok ? 'PASS: ' : 'FAIL: ') + name + (details ? ' (' + details + ')' : ''));
    return ok;
  }

  window.__RUNTIME_ERRORS = [];
  window.addEventListener('error', function(e) {
    const errInfo = {
      message: e.message || String(e),
      filename: e.filename || 'unknown',
      lineno: e.lineno || 0
    };
    window.__RUNTIME_ERRORS.push(errInfo);
    testResults.errors.push(errInfo);
    sendLog('ERROR: ' + errInfo.message + ' at line ' + errInfo.lineno);
  });

  window.addEventListener('unhandledrejection', function(e) {
    const reasonMsg = e.reason ? (e.reason.message || String(e.reason)) : 'unknown rejection';
    const errInfo = { message: 'Unhandled Promise Rejection: ' + reasonMsg };
    window.__RUNTIME_ERRORS.push(errInfo);
    testResults.errors.push(errInfo);
    sendLog('PROMISE ERROR: ' + reasonMsg);
  });

  async function reportResults() {
    try {
      testResults.passed = testResults.errors.length === 0 && testResults.assertions.every(a => a.passed);
      sendLog('Reporting final results to server...');
      await fetch('/__report_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testResults)
      });
    } catch (err) {
      sendLog('FATAL: Could not report results: ' + err.message);
    }
  }

  async function runTestSuite() {
    sendLog('runTestSuite() started');
    
    // Brief settling delay
    await new Promise(r => setTimeout(r, 300));

    try {
      // 1. Verify window.App bootstrap
      assert('window.App exists', typeof window.App === 'object' && window.App !== null);
      if (!window.App) throw new Error('window.App is not defined');

      // 2. Hydrate study data from local updates.json if currently empty
      try {
        sendLog('Checking study data hydration...');
        const res = await fetch('/updates.json');
        if (res.ok) {
          const payload = await res.json();
          if (typeof window.App.saveSyncedData === 'function') {
            window.App.saveSyncedData(payload);
            sendLog('Hydrated study data via window.App.saveSyncedData');
          }
        }
      } catch (hydrateErr) {
        sendLog('Hydration note: ' + hydrateErr.message);
      }

      // 3. Verify registered App methods
      const requiredMethods = [
        'navigateSection',
        'renderFormulaVaultView',
        'setFormulaSubjectFilter',
        'setFormulaSearchQuery',
        'togglePinFormula',
        'togglePinnedOnlyFilter',
        'copyFormulaTeX',
        'jumpToFormulaContext',
        'printFormulaSheet',
        'renderFlashcardsView',
        'startFlashcardSession'
      ];
      requiredMethods.forEach(method => {
        assert(`App.${method} is function`, typeof window.App[method] === 'function');
      });

      // 4. Test Navigation: Overview
      window.App.navigateSection('overview');
      const overviewSection = document.getElementById('viewSection-overview');
      assert('Overview section visible', overviewSection && !overviewSection.classList.contains('hidden'));

      // 5. Test Navigation: Formula Vault
      window.App.navigateSection('formulas');
      const formulaSection = document.getElementById('viewSection-formulas');
      assert('Formula section visible', formulaSection && !formulaSection.classList.contains('hidden'));

      const formulaContainer = document.getElementById('formulaVaultContainer');
      assert('Formula container rendered', formulaContainer && formulaContainer.children.length > 0);

      const formulaCards = formulaContainer.querySelectorAll('.grid > div');
      assert('Formulas aggregated and rendered (> 0 cards)', formulaCards.length > 0, `Count: ${formulaCards.length}`);

      // 6. Test Subject Filtering in Formula Vault
      window.App.setFormulaSubjectFilter('Physics');
      const physicsCards = formulaContainer.querySelectorAll('.grid > div');
      assert('Physics subject filter applied', physicsCards.length > 0, `Physics count: ${physicsCards.length}`);

      // Reset subject filter
      window.App.setFormulaSubjectFilter('all');

      // 7. Test Formula Search Query
      window.App.setFormulaSearchQuery('torque');
      const searchCards = formulaContainer.querySelectorAll('.grid > div');
      assert('Formula search query applied for "torque"', searchCards.length > 0, `Search count: ${searchCards.length}`);

      // Reset search query
      window.App.setFormulaSearchQuery('');

      // 8. Test Navigation: Flashcards & Active Recall
      window.App.navigateSection('quiz_sets');
      const quizSection = document.getElementById('viewSection-quiz_sets');
      assert('Flashcards section visible', quizSection && !quizSection.classList.contains('hidden'));

      const flashcardsList = document.getElementById('quizSetsListContainer') || document.getElementById('flashcardsListContainer');
      assert('Flashcard decks container rendered', flashcardsList && flashcardsList.innerHTML.trim().length > 0);

      // 9. Test Navigation: Credits & Guidebook & Settings
      ['guidebook', 'credits', 'settings'].forEach(sec => {
        window.App.navigateSection(sec);
        const el = document.getElementById(`viewSection-${sec}`);
        assert(`Section ${sec} navigates cleanly`, el && !el.classList.contains('hidden'));
      });

      // 10. Final check for runtime console/promise errors
      assert('Zero runtime errors recorded', window.__RUNTIME_ERRORS.length === 0, 
        window.__RUNTIME_ERRORS.map(e => e.message).join('; '));

    } catch (err) {
      sendLog('Fatal error during test suite execution: ' + err.message);
      testResults.errors.push({ message: err.message, stack: err.stack });
    } finally {
      await reportResults();
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(runTestSuite, 200);
  } else {
    window.addEventListener('load', runTestSuite);
  }
})();
