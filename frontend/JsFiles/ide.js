
document.addEventListener('DOMContentLoaded', () => {

    // ==============================
    // Judge0 Language Mapping
    // ==============================
    const languageMap = {
        python: 71,
        cpp: 54,
        java: 62
    };

    let currentProblem = null;

    // ==============================
    // Initialize CodeMirror
    // ==============================
    const codeTextArea = document.getElementById('codeEditor');
    const editor = CodeMirror.fromTextArea(codeTextArea, {
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        autoCloseBrackets: true
    });

    // ==============================
    // Language Change Handler
    // ==============================
    document.getElementById('langSelect').addEventListener('change', (e) => {
        const lang = e.target.value;
        let mode = 'python';
        let defaultCode = '';

        if (lang === 'cpp') {
            mode = 'text/x-c++src';
            defaultCode =
                `#include <iostream>
using namespace std;

int main() {
    return 0;
}`;
        }
        else if (lang === 'java') {
            mode = 'text/x-java';
            defaultCode =
                `import java.util.*;

public class Main {
    public static void main(String[] args) {

    }
}`;
        }
        else {
            mode = 'python';
            defaultCode =
                `def solve():
    pass

if __name__ == "__main__":
    solve()`;
        }

        editor.setOption('mode', mode);
        editor.setValue(defaultCode);
    });

    // ==============================
    // Default Starter Code
    // ==============================
    editor.setValue(
        `def solve():
    pass

if __name__ == "__main__":
    solve()`
    );

    // ==============================
    // Load Problem from Backend
    // ==============================
    async function loadProblem(problemId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/problems/${problemId}/`);
            const prob = await response.json();

            if (!prob || prob.error) {
                showProblemNotFound();
                return;
            }

            currentProblem = prob;

            document.getElementById('probTitle').textContent = prob.title;

            const diffBadge = document.getElementById('probDiff');
            diffBadge.textContent = prob.difficulty;
            diffBadge.style.display = 'inline-block';
            diffBadge.className = 'diff-badge ' + prob.difficulty.toLowerCase();

            document.getElementById('probStatement').innerHTML = prob.statement;

            const constraintsList = document.getElementById('probConstraints');
            constraintsList.innerHTML = '';

            if (prob.constraints && prob.constraints.length > 0) {
                prob.constraints.forEach(c => {
                    const li = document.createElement('li');
                    li.textContent = c;
                    constraintsList.appendChild(li);
                });
            } else {
                constraintsList.innerHTML = '<li>N/A</li>';
            }

            document.getElementById('probSampleIn').textContent = prob.sample_input || 'N/A';
            document.getElementById('probSampleOut').textContent = prob.sample_output || 'N/A';

        } catch (error) {
            console.error("Error loading problem:", error);
            showProblemNotFound();
        }
    }

    // ==============================
    // Problem Not Found UI
    // ==============================
    function showProblemNotFound() {
        document.getElementById('probTitle').textContent = 'Problem Not Found';
        document.getElementById('probDiff').style.display = 'none';
        document.getElementById('probStatement').innerHTML =
            '<p>Unable to load problem data from backend.</p>';
        document.getElementById('probConstraints').innerHTML = '<li>N/A</li>';
        document.getElementById('probSampleIn').textContent = 'N/A';
        document.getElementById('probSampleOut').textContent = 'N/A';
    }

    // ==============================
    // Load Hidden Testcases
    // ==============================
    async function loadHiddenTests(problemId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/problems/${problemId}/testcases/`);
            const tests = await response.json();

            return tests.filter(tc => !tc.is_sample);

        } catch (error) {
            console.error("Failed loading hidden tests:", error);
            return [];
        }
    }

    // ==============================
    // Get Problem ID from URL
    // ==============================
    const urlParams = new URLSearchParams(window.location.search);
    const problemId = urlParams.get('id');

    if (problemId) {
        loadProblem(problemId);
    } else {
        showProblemNotFound();
    }

    // ==============================
    // Console Elements
    // ==============================
    const consoleOutput = document.getElementById('consoleOutput');
    const consoleStatus = document.getElementById('consoleStatus');

    // ==============================
    // Run Sample Test
    // ==============================
    document.getElementById('runBtn').addEventListener('click', async () => {

        if (!currentProblem) {
            consoleOutput.textContent = "Problem not loaded.";
            return;
        }

        consoleStatus.textContent = 'Running';
        consoleStatus.className = 'console-status status-running';
        consoleOutput.textContent = 'Executing sample test...\n';

        try {
            const response = await fetch(
                "http://localhost:2358/submissions?base64_encoded=false&wait=true",
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        source_code: editor.getValue(),
                        language_id: languageMap[document.getElementById('langSelect').value],
                        stdin: currentProblem.sample_input
                    })
                }
            );

            const result = await response.json();

            let actualOutput =
                result.stdout ||
                result.stderr ||
                result.compile_output ||
                result.message ||
                "";

            actualOutput = actualOutput.trim();

            if (result.status.id !== 3) {
                consoleStatus.textContent = 'Error';
                consoleStatus.className = 'console-status status-wa';
                consoleOutput.textContent =
                    `Execution Error:
${actualOutput}`;
                return;
            }

            consoleStatus.textContent = 'Finished';
            consoleStatus.className = 'console-status status-idle';

            consoleOutput.textContent =
                `--- Your Output ---
${actualOutput}

--- Expected Output ---
${currentProblem.sample_output.trim()}`;

        } catch (error) {
            consoleStatus.textContent = 'Error';
            consoleOutput.textContent = error.message;
        }
    });

    // ==============================
    // Submit Hidden Tests
    // ==============================
    document.getElementById('submitBtn').addEventListener('click', async (event) => {
        event.preventDefault();
        if (!currentProblem) {
            consoleOutput.textContent = "Problem not loaded.";
            return;
        }

        consoleStatus.textContent = 'Judging';
        consoleStatus.className = 'console-status status-running';
        consoleOutput.textContent = 'Evaluating hidden test cases...\n';

        try {
            const hiddenTests = await loadHiddenTests(problemId);

            if (hiddenTests.length === 0) {
                consoleStatus.textContent = 'Error';
                consoleOutput.textContent = 'No hidden test cases found.';
                return;
            }

            for (let i = 0; i < hiddenTests.length; i++) {

                const tc = hiddenTests[i];

                const response = await fetch(
                    "http://localhost:2358/submissions?base64_encoded=false&wait=true",
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            source_code: editor.getValue(),
                            language_id: languageMap[document.getElementById('langSelect').value],
                            stdin: tc.input_data
                        })
                    }
                );

                const result = await response.json();

                let actualOutput =
                    result.stdout ||
                    result.stderr ||
                    result.compile_output ||
                    result.message ||
                    "";

                actualOutput = actualOutput.trim();
                const expectedOutput = tc.expected_output.trim();

                // Compilation / Runtime Error
                if (result.status.id !== 3) {
                    consoleStatus.textContent = 'Runtime Error';
                    consoleStatus.className = 'console-status status-wa';

                    consoleOutput.textContent =
                        `Failed on Hidden Test ${i + 1}

Execution Error:
${actualOutput}`;
                    return;
                }

                // Wrong Answer
                if (actualOutput !== expectedOutput) {
                    consoleStatus.textContent = 'Wrong Answer';
                    consoleStatus.className = 'console-status status-wa';

                    consoleOutput.textContent =
                        `Failed on Hidden Test ${i + 1}

Input:
${tc.input_data}

Expected Output:
${expectedOutput}

Your Output:
${actualOutput}`;
                    return;
                }
            }

            // Accepted
            consoleStatus.textContent = 'Accepted';
            consoleStatus.className = 'console-status status-ac';

            consoleOutput.textContent =
                `Accepted \nAll hidden test cases passed successfully.`;

            const userId = localStorage.getItem('nodeverse_user_id');

            if (userId) {
                try {
                    // Get current user data
                    const userResponse = await fetch(`http://127.0.0.1:8000/api/users/${userId}/`);
                    const userData = await userResponse.json();

                    // Get today's date
                    const today = new Date().toISOString().split('T')[0];

                    // Existing submissions object
                    let dailySubmissions = userData.daily_submissions || {};

                    // Add today if missing
                    if (!dailySubmissions[today]) {
                        dailySubmissions[today] = 0;
                    }

                    // Increase today's submissions
                    dailySubmissions[today] += 1;

                    // Update backend
                    await fetch(`http://127.0.0.1:8000/api/users/${userId}/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            solved_problems: userData.solved_problems + 1,
                            daily_submissions: dailySubmissions
                        })
                    });

                } catch (updateError) {
                    console.error("Failed updating user stats:", updateError);
                }
            }






        } catch (error) {
            consoleStatus.textContent = 'Error';
            consoleStatus.className = 'console-status status-wa';
            consoleOutput.textContent = error.message;
        }
    });

});