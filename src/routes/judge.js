import express from "express";
import {
  submitCode,
  getSubmission,
  getSubmissionByToken,
  getAllSubmissions,
  handleCallback,
  getUserSubmissions,
  getUserStats,
  getQuestionSubmissions,
  getRecentSubmissions,
  getQuestionLeaderboard,
} from "../controllers/judgeController.js";

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Submission MongoDB ObjectId
 *           example: "68905a9e681e9fbaea2b907e"
 *         submissionId:
 *           type: string
 *           description: Same as _id for convenience
 *           example: "68905a9e681e9fbaea2b907e"
 *         userId:
 *           type: number
 *           description: Reference to the user ID
 *           example: 123
 *         questionId:
 *           type: object
 *           description: Associated question details
 *           properties:
 *             _id:
 *               type: string
 *               example: "689057a297ab3c92689f3dbb"
 *             title:
 *               type: string
 *               example: "Hello World"
 *             slug:
 *               type: string
 *               example: "hello-world"
 *             difficulty:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   example: "Easy"
 *                 score:
 *                   type: number
 *                   example: 1
 *         sourceCode:
 *           type: string
 *           description: Submitted source code
 *           example: "def solution():\n    return \"Hello, World!\""
 *         language:
 *           type: object
 *           description: Programming language information
 *           properties:
 *             id:
 *               type: number
 *               description: Judge0 language ID
 *               example: 71
 *             name:
 *               type: string
 *               description: Programming language name
 *               enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *               example: "python"
 *         status:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               description: Judge0 status ID
 *               example: 1
 *             description:
 *               type: string
 *               description: Human-readable status
 *               example: "In Queue"
 *         verdict:
 *           type: string
 *           description: Final judgment on the submission
 *           enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Unknown", "Pending"]
 *           example: "Pending"
 *         stdout:
 *           type: string
 *           description: Program output
 *           example: ""
 *         stderr:
 *           type: string
 *           description: Error output
 *           example: ""
 *         executionTime:
 *           type: number
 *           nullable: true
 *           description: Execution time in milliseconds
 *           example: null
 *         memoryUsed:
 *           type: number
 *           nullable: true
 *           description: Memory usage in KB
 *           example: null
 *         compileOutput:
 *           type: string
 *           description: Compilation output
 *           example: ""
 *         tokens:
 *           type: array
 *           items:
 *             type: string
 *           description: Judge0 submission tokens
 *           example: ["c20bb596-9620-41e0-a121-946e4b1cb7dd"]
 *         submissionType:
 *           type: string
 *           enum: ["single", "batch"]
 *           description: Type of submission
 *           example: "batch"
 *         testCases:
 *           type: array
 *           description: Test case results for batch submissions
 *           items:
 *             type: object
 *             properties:
 *               stdin:
 *                 type: string
 *                 description: Input for test case
 *                 example: ""
 *               expectedOutput:
 *                 type: string
 *                 description: Expected output
 *                 example: "Hello, World!"
 *               stdout:
 *                 type: string
 *                 description: Actual output
 *                 example: ""
 *               stderr:
 *                 type: string
 *                 description: Error output
 *                 example: ""
 *               verdict:
 *                 type: string
 *                 description: Test case verdict
 *                 example: "Unknown"
 *               executionTime:
 *                 type: number
 *                 nullable: true
 *                 description: Execution time for this test case
 *                 example: null
 *               memoryUsed:
 *                 type: number
 *                 nullable: true
 *                 description: Memory used for this test case
 *                 example: null
 *         batchSummary:
 *           type: object
 *           description: Summary for batch submissions
 *           properties:
 *             totalTestCases:
 *               type: number
 *               description: Total number of test cases
 *               example: 1
 *             passedTestCases:
 *               type: number
 *               description: Number of passed test cases
 *               example: 0
 *             failedTestCases:
 *               type: number
 *               description: Number of failed test cases
 *               example: 1
 *             overallVerdict:
 *               type: string
 *               description: Overall verdict for all test cases
 *               example: "Pending"
 *         isCompleted:
 *           type: boolean
 *           description: Whether submission processing is complete
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When submission was created
 *           example: "2025-08-04T07:00:46.873Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When submission processing completed
 *           example: null
 *     TokenSubmissionResponse:
 *       type: object
 *       description: Judge0-compatible submission response accessed by token
 *       properties:
 *         token:
 *           type: string
 *           description: Judge0 submission token
 *           example: "c20bb596-9620-41e0-a121-946e4b1cb7dd"
 *         submissionId:
 *           type: string
 *           description: MongoDB submission ID
 *           example: "68905a9e681e9fbaea2b907e"
 *         status:
 *           type: string
 *           description: Execution status
 *           example: "Accepted"
 *         verdict:
 *           type: string
 *           description: Final verdict
 *           enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Unknown", "Pending"]
 *           example: "Accepted"
 *         stdout:
 *           type: string
 *           nullable: true
 *           description: Program output
 *           example: "Hello, World!"
 *         stderr:
 *           type: string
 *           nullable: true
 *           description: Error output
 *           example: null
 *         executionTime:
 *           type: string
 *           description: Execution time as string (Judge0 format)
 *           example: "0.028"
 *         memoryUsed:
 *           type: number
 *           description: Memory usage in KB
 *           example: 3228
 *         compileOutput:
 *           type: string
 *           nullable: true
 *           description: Compilation output
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When submission was created
 *           example: "2025-08-04T07:00:46.873Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When submission processing completed
 *           example: "2025-08-04T07:09:09.243Z"
 *         submissionType:
 *           type: string
 *           enum: ["single", "batch"]
 *           description: Type of submission
 *           example: "batch"
 *         question:
 *           type: object
 *           description: Associated question information
 *           properties:
 *             _id:
 *               type: string
 *               example: "689057a297ab3c92689f3dbb"
 *             title:
 *               type: string
 *               example: "Hello World"
 *             slug:
 *               type: string
 *               example: "hello-world"
 *             difficulty:
 *               type: object
 *               properties:
 *                 level:
 *                   type: string
 *                   example: "Easy"
 *                 score:
 *                   type: number
 *                   example: 1
 *     SubmissionRequest:
 *       type: object
 *       required:
 *         - questionId
 *         - code
 *         - language
 *       properties:
 *         questionId:
 *           type: string
 *           description: ID of the question to solve
 *           example: "60f7b1b5e4b0a3001f5e4b0a"
 *         code:
 *           type: string
 *           description: Source code solution
 *           example: "def solution(nums, target):\n    return [0, 1]"
 *         language:
 *           type: string
 *           description: Programming language
 *           enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *           example: "python"
 *     SubmissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Code submitted successfully"
 *         data:
 *           type: object
 *           properties:
 *             submissionId:
 *               type: string
 *               description: ID of the created submission
 *             tokens:
 *               type: array
 *               items:
 *                 type: string
 *               description: Judge0 submission tokens
 *             status:
 *               type: string
 *               example: "In Queue"
 *     UserStats:
 *       type: object
 *       properties:
 *         totalSubmissions:
 *           type: number
 *           description: Total number of submissions
 *         acceptedSubmissions:
 *           type: number
 *           description: Number of accepted submissions
 *         acceptanceRate:
 *           type: number
 *           description: Acceptance rate percentage
 *         totalQuestionsSolved:
 *           type: number
 *           description: Number of unique questions solved
 *         averageExecutionTime:
 *           type: number
 *           description: Average execution time in milliseconds
 *         languageBreakdown:
 *           type: object
 *           description: Submissions count by language
 *         difficultyBreakdown:
 *           type: object
 *           description: Solved questions by difficulty
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         executionTime:
 *           type: number
 *           description: Best execution time
 *         memoryUsage:
 *           type: number
 *           description: Memory usage
 *         submissionTime:
 *           type: string
 *           format: date-time
 *           description: When the best solution was submitted
 *         rank:
 *           type: number
 *           description: Rank on leaderboard
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 */

/**
 * @swagger
 * tags:
 *   name: Judge
 *   description: |
 *     Code execution and submission management endpoints powered by Judge0 API.
 *
 *     **Core Features:**
 *     - Submit code solutions to questions
 *     - Real-time execution via Judge0 API
 *     - Support for multiple programming languages
 *     - Automatic test case evaluation
 *     - Performance tracking and statistics
 *     - Leaderboards and user rankings
 *
 *     **Submission Access Methods:**
 *     - **By Submission ID**: Access via MongoDB ObjectId (`/submission/{submissionId}`)
 *       - Returns complete submission data with question details
 *       - Structured response with nested objects
 *       - Best for client applications needing full context
 *
 *     - **By Judge0 Token**: Access via Judge0 token (`/submission/token/{token}`)
 *       - Judge0-compatible response format
 *       - Real-time execution results if not completed
 *       - Best for Judge0 API compatibility and real-time monitoring
 *
 *     **Supported Languages:**
 *     - Python (3.8+) - ID: 71
 *     - JavaScript (Node.js) - ID: 63
 *     - Java (OpenJDK 11+) - ID: 62
 *     - C++ (GCC 9.4+) - ID: 54
 *     - C (GCC 9.4+) - ID: 50
 *     - C# (.NET Core) - ID: 51
 *     - Go (1.19+) - ID: 60
 *     - Rust (1.65+) - ID: 73
 *     - Ruby (3.0+) - ID: 72
 *     - PHP (8.1+) - ID: 68
 */

/**
 * @swagger
 * /judge/submit:
 *   post:
 *     tags:
 *       - Judge
 *     summary: Submit code solution for a question
 *     description: |
 *       Submit a code solution for evaluation against a specific question's test cases.
 *
 *       **Process:**
 *       1. Code is validated and submitted to Judge0
 *       2. Test cases are run automatically
 *       3. Results are evaluated and stored
 *       4. Question statistics are updated
 *
 *       **Supported Languages:**
 *       - Python (3.8+)
 *       - JavaScript (Node.js)
 *       - Java (OpenJDK 11+)
 *       - C++ (GCC 9.4+)
 *       - C (GCC 9.4+)
 *       - C# (.NET Core)
 *       - Go (1.19+)
 *       - Rust (1.65+)
 *       - Ruby (3.0+)
 *       - PHP (8.1+)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmissionRequest'
 *           examples:
 *             pythonSolution:
 *               summary: Python solution example
 *               value:
 *                 questionId: "60f7b1b5e4b0a3001f5e4b0a"
 *                 code: |
 *                   def solution(nums, target):
 *                       seen = {}
 *                       for i, num in enumerate(nums):
 *                           complement = target - num
 *                           if complement in seen:
 *                               return [seen[complement], i]
 *                           seen[num] = i
 *                       return []
 *                 language: "python"
 *             javascriptSolution:
 *               summary: JavaScript solution example
 *               value:
 *                 questionId: "60f7b1b5e4b0a3001f5e4b0a"
 *                 code: |
 *                   function solution(nums, target) {
 *                       const seen = new Map();
 *                       for (let i = 0; i < nums.length; i++) {
 *                           const complement = target - nums[i];
 *                           if (seen.has(complement)) {
 *                               return [seen.get(complement), i];
 *                           }
 *                           seen.set(nums[i], i);
 *                       }
 *                       return [];
 *                   }
 *                 language: "javascript"
 *     responses:
 *       200:
 *         description: Code submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmissionResponse'
 *             example:
 *               success: true
 *               message: "Code submitted successfully"
 *               data:
 *                 submissionId: "60f7b1b5e4b0a3001f5e4b0b"
 *                 tokens: ["abc123", "def456", "ghi789"]
 *                 status: "In Queue"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid language specified"
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.post("/submit", submitCode);

/**
 * @swagger
 * /judge/submission/{submissionId}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get submission details by submission ID
 *     description: |
 *       Retrieve detailed information about a specific code submission by its MongoDB ObjectId.
 *       This endpoint returns comprehensive submission data including:
 *       - Complete submission metadata
 *       - Source code and language information
 *       - Execution status and results
 *       - Test case details and outcomes
 *       - Performance metrics
 *       - Associated question information
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the submission
 *         example: "68905a9e681e9fbaea2b907e"
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Submission retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: Submission MongoDB ObjectId
 *                       example: "68905a9e681e9fbaea2b907e"
 *                     submissionId:
 *                       type: string
 *                       description: Same as _id for convenience
 *                       example: "68905a9e681e9fbaea2b907e"
 *                     userId:
 *                       type: number
 *                       description: User ID who submitted the code
 *                       example: 123
 *                     questionId:
 *                       type: object
 *                       description: Associated question details
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "689057a297ab3c92689f3dbb"
 *                         title:
 *                           type: string
 *                           example: "Hello World"
 *                         slug:
 *                           type: string
 *                           example: "hello-world"
 *                         difficulty:
 *                           type: object
 *                           properties:
 *                             level:
 *                               type: string
 *                               example: "Easy"
 *                             score:
 *                               type: number
 *                               example: 1
 *                     sourceCode:
 *                       type: string
 *                       description: The submitted source code
 *                       example: "def solution():\n    return \"Hello, World!\""
 *                     language:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           description: Judge0 language ID
 *                           example: 71
 *                         name:
 *                           type: string
 *                           description: Programming language name
 *                           example: "python"
 *                     status:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                           description: Judge0 status ID
 *                           example: 1
 *                         description:
 *                           type: string
 *                           description: Human-readable status
 *                           example: "In Queue"
 *                     verdict:
 *                       type: string
 *                       description: Final judgment
 *                       enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error", "Unknown", "Pending"]
 *                       example: "Pending"
 *                     stdout:
 *                       type: string
 *                       description: Program output
 *                       example: ""
 *                     stderr:
 *                       type: string
 *                       description: Error output
 *                       example: ""
 *                     executionTime:
 *                       type: number
 *                       nullable: true
 *                       description: Execution time in milliseconds
 *                       example: null
 *                     memoryUsed:
 *                       type: number
 *                       nullable: true
 *                       description: Memory usage in KB
 *                       example: null
 *                     compileOutput:
 *                       type: string
 *                       description: Compilation output
 *                       example: ""
 *                     tokens:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Judge0 submission tokens
 *                       example: ["c20bb596-9620-41e0-a121-946e4b1cb7dd"]
 *                     submissionType:
 *                       type: string
 *                       enum: ["single", "batch"]
 *                       description: Type of submission
 *                       example: "batch"
 *                     testCases:
 *                       type: array
 *                       description: Test case results (for batch submissions)
 *                       items:
 *                         type: object
 *                         properties:
 *                           stdin:
 *                             type: string
 *                             example: ""
 *                           expectedOutput:
 *                             type: string
 *                             example: "Hello, World!"
 *                           stdout:
 *                             type: string
 *                             example: ""
 *                           stderr:
 *                             type: string
 *                             example: ""
 *                           verdict:
 *                             type: string
 *                             example: "Unknown"
 *                           executionTime:
 *                             type: number
 *                             nullable: true
 *                             example: null
 *                           memoryUsed:
 *                             type: number
 *                             nullable: true
 *                             example: null
 *                     batchSummary:
 *                       type: object
 *                       description: Summary for batch submissions
 *                       properties:
 *                         totalTestCases:
 *                           type: number
 *                           example: 1
 *                         passedTestCases:
 *                           type: number
 *                           example: 0
 *                         failedTestCases:
 *                           type: number
 *                           example: 1
 *                         overallVerdict:
 *                           type: string
 *                           example: "Pending"
 *                     isCompleted:
 *                       type: boolean
 *                       description: Whether submission processing is complete
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: When submission was created
 *                       example: "2025-08-04T07:00:46.873Z"
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: When submission processing completed
 *                       example: null
 *       400:
 *         description: Invalid submission ID format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Submission ID is required"
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Submission not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to retrieve submission"
 *                 details:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get("/submission/:submissionId", getSubmission);

/**
 * @swagger
 * /judge/submission/token/{token}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get submission details by Judge0 token
 *     description: |
 *       Retrieve detailed information about a specific code submission using Judge0 token.
 *       This endpoint follows Judge0 API standards and can fetch real-time execution results.
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Judge0 submission token
 *         example: "c20bb596-9620-41e0-a121-946e4b1cb7dd"
 *     responses:
 *       200:
 *         description: Submission details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenSubmissionResponse'
 *             example:
 *               token: "c20bb596-9620-41e0-a121-946e4b1cb7dd"
 *               submissionId: "68905a9e681e9fbaea2b907e"
 *               status: "Accepted"
 *               verdict: "Accepted"
 *               stdout: "Hello, World!"
 *               stderr: null
 *               executionTime: "0.028"
 *               memoryUsed: 3228
 *               compileOutput: null
 *               createdAt: "2025-08-04T07:00:46.873Z"
 *               completedAt: "2025-08-04T07:09:09.243Z"
 *               submissionType: "batch"
 *               question:
 *                 _id: "689057a297ab3c92689f3dbb"
 *                 title: "Hello World"
 *                 slug: "hello-world"
 *                 difficulty:
 *                   level: "Easy"
 *                   score: 1
 *       404:
 *         description: Submission not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Submission not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch submission details"
 */
router.get("/submission/token/:token", getSubmissionByToken);

/**
 * @swagger
 * /judge/submissions:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get all submissions with pagination
 *     description: |
 *       Retrieve a paginated list of all submissions in the system.
 *       Useful for admin monitoring and system overview.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of submissions to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of submissions to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, wrong_answer, time_limit_exceeded, compilation_error]
 *         description: Filter by submission status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *         description: Filter by programming language
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         skip:
 *                           type: number
 *                         hasMore:
 *                           type: boolean
 *       500:
 *         description: Server error
 */
router.get("/submissions", getAllSubmissions);

/**
 * @swagger
 * /judge/callback:
 *   put:
 *     tags:
 *       - Judge
 *     summary: Judge0 webhook callback (Internal)
 *     description: |
 *       **Internal endpoint used by Judge0 API**
 *
 *       This endpoint receives execution results from Judge0 and updates
 *       submission records. Not intended for direct client use.
 *
 *       **Process:**
 *       1. Judge0 sends execution results
 *       2. Submission record is updated
 *       3. Question statistics are recalculated
 *       4. User statistics are updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Judge0 submission token
 *               stdout:
 *                 type: string
 *                 description: Program output
 *               stderr:
 *                 type: string
 *                 description: Error output
 *               compile_output:
 *                 type: string
 *                 description: Compilation output
 *               message:
 *                 type: string
 *                 description: Status message
 *               status:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   description:
 *                     type: string
 *               time:
 *                 type: string
 *                 description: Execution time
 *               memory:
 *                 type: number
 *                 description: Memory usage in KB
 *     responses:
 *       200:
 *         description: Callback processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Callback processed successfully"
 *       400:
 *         description: Invalid callback data
 *       500:
 *         description: Server error
 */
router.put("/callback", handleCallback);

/**
 * @swagger
 * /judge/submissions/user/{userId}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get user's submissions history
 *     description: |
 *       Retrieve all submissions made by a specific user with optional filtering.
 *       Includes detailed information about each submission's performance.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60f7b1b5e4b0a3001f5e4b0c"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of submissions to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of submissions to skip
 *       - in: query
 *         name: questionId
 *         schema:
 *           type: string
 *         description: Filter by specific question
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, wrong_answer, time_limit_exceeded, compilation_error]
 *         description: Filter by submission status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *         description: Filter by programming language
 *     responses:
 *       200:
 *         description: User submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         skip:
 *                           type: number
 *                         hasMore:
 *                           type: boolean
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - can only view own submissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/submissions/user/:userId", getUserSubmissions);

/**
 * @swagger
 * /judge/stats/{userId}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get user's submission statistics
 *     description: |
 *       Retrieve comprehensive statistics about a user's coding performance including:
 *       - Total submissions and acceptance rate
 *       - Questions solved by difficulty
 *       - Language usage breakdown
 *       - Performance metrics
 *       - Progress tracking
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *         example: "60f7b1b5e4b0a3001f5e4b0c"
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *             example:
 *               success: true
 *               message: "User statistics retrieved successfully"
 *               data:
 *                 totalSubmissions: 150
 *                 acceptedSubmissions: 120
 *                 acceptanceRate: 80.0
 *                 totalQuestionsSolved: 95
 *                 averageExecutionTime: 52.3
 *                 languageBreakdown:
 *                   python: 80
 *                   javascript: 45
 *                   java: 25
 *                 difficultyBreakdown:
 *                   Easy: 45
 *                   Medium: 35
 *                   Hard: 15
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied - can only view own statistics
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/stats/:userId", getUserStats);

/**
 * @swagger
 * /judge/submissions/question/{questionId}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get submissions for a specific question
 *     description: |
 *       Retrieve all submissions for a particular question.
 *       Useful for analyzing question difficulty and user approaches.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *         example: "60f7b1b5e4b0a3001f5e4b0a"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Optional filter by specific user
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, wrong_answer, time_limit_exceeded, compilation_error]
 *         description: Filter by submission status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           minimum: 1
 *           maximum: 100
 *         description: Number of submissions to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *           minimum: 0
 *         description: Number of submissions to skip
 *     responses:
 *       200:
 *         description: Question submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     submissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Submission'
 *                     questionInfo:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         difficulty:
 *                           type: object
 *                         totalSubmissions:
 *                           type: number
 *                         acceptanceRate:
 *                           type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         skip:
 *                           type: number
 *                         hasMore:
 *                           type: boolean
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get("/submissions/question/:questionId", getQuestionSubmissions);

/**
 * @swagger
 * /judge/submissions/recent:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get recent submissions across the platform
 *     description: |
 *       Retrieve the most recent submissions from all users.
 *       Useful for monitoring platform activity and real-time updates.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of recent submissions to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, wrong_answer, time_limit_exceeded, compilation_error]
 *         description: Filter by submission status
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *         description: Filter by programming language
 *     responses:
 *       200:
 *         description: Recent submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Submission'
 *                       - type: object
 *                         properties:
 *                           questionInfo:
 *                             type: object
 *                             properties:
 *                               title:
 *                                 type: string
 *                               slug:
 *                                 type: string
 *                               difficulty:
 *                                 type: object
 *                           userInfo:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *       500:
 *         description: Server error
 */
router.get("/submissions/recent", getRecentSubmissions);

/**
 * @swagger
 * /judge/leaderboard/question/{questionId}:
 *   get:
 *     tags:
 *       - Judge
 *     summary: Get question leaderboard
 *     description: |
 *       Retrieve the leaderboard for a specific question showing the best solutions.
 *       Rankings are based on execution time, memory usage, and submission time.
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *         example: "60f7b1b5e4b0a3001f5e4b0a"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 100
 *         description: Number of leaderboard entries to return
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           enum: [python, javascript, java, cpp, c, csharp, go, rust, ruby, php]
 *         description: Filter by programming language
 *     responses:
 *       200:
 *         description: Question leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionInfo:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         difficulty:
 *                           type: object
 *                         totalSubmissions:
 *                           type: number
 *                         acceptanceRate:
 *                           type: number
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaderboardEntry'
 *             example:
 *               success: true
 *               message: "Leaderboard retrieved successfully"
 *               data:
 *                 questionInfo:
 *                   title: "Two Sum"
 *                   difficulty:
 *                     level: "Easy"
 *                     score: 2
 *                   totalSubmissions: 1500
 *                   acceptanceRate: 65.5
 *                 leaderboard:
 *                   - userId: "60f7b1b5e4b0a3001f5e4b0c"
 *                     username: "speedcoder"
 *                     executionTime: 28.5
 *                     memoryUsage: 12800
 *                     submissionTime: "2024-01-15T10:30:00Z"
 *                     rank: 1
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
router.get("/leaderboard/question/:questionId", getQuestionLeaderboard);

export default router;
