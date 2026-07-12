<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>Mastering the .berry DSL Language · Flexiberry Guides</title>
  <meta
    name="description"
    content="A comprehensive guide to writing scripts in the .berry Domain Specific Language (DSL). Learn variables, API definitions, dynamic captures, environments, and assertions."
  />
</svelte:head>

<div class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between">
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-12 overflow-hidden text-center">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"></div>
        <div class="absolute top-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"></div>
      </div>

      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-w-3xl mx-auto px-6">
        <a href="/blog" class="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Guides
        </a>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4">
          Mastering the .berry DSL Language
        </h1>
        <div class="flex items-center justify-center gap-4 text-xs text-slate-500 mb-2">
          <span>Language Reference</span>
          <span>•</span>
          <span>July 11, 2026</span>
          <span>•</span>
          <span>8 min read</span>
        </div>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        
        <p>
          Berry is a clean, indentation-aware scripting language designed to orchestrate sequential API workflows, perform test assertions, and execute automated tasks. It reads like plain English, removes syntax noise like curly braces and semi-colons, and compiles into a strongly-typed Abstract Syntax Tree (AST) before running in an event-driven runtime environment.
        </p>
        <p>
          This guide provides a comprehensive tutorial on writing scripts in the <strong>.berry DSL</strong>. We will cover declaring APIs, defining sequences with tasks and steps, dynamic variables, capturing response values, making assertions, and handling encrypted secrets.
        </p>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 1: Declaring APIs (Basic)</h2>
          <p>
            At its core, a <code>.berry</code> script is used to execute HTTP requests. The <code>Api</code> keyword defines reusable request specifications.
          </p>

          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">Syntax:</h3>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Api &lt;METHOD&gt; #&lt;ApiName&gt; [Optional Description]
Url &lt;URL&gt;
Header
- &lt;Header-Key&gt;: '&lt;Header-Value&gt;'
Body &lt;Type&gt; `&lt;Content&gt;`</code></pre>

          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">1.1 Simple GET Request (No Body)</h3>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Api GET #getPetById Fetch pet details from store
Url https://petstore.swagger.io/v2/pet/&#123;&#123;petId&#125;&#125;
Header
- Accept: 'application/json'</code></pre>
          <p class="text-xs text-slate-500 mt-2">
            Note: <code>&#123;&#123;petId&#125;&#125;</code> acts as a placeholder that will be dynamically resolved or interpolated when the API is invoked.
          </p>

          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">1.2 POST Request with JSON Body</h3>
          <p>For request bodies, Berry supports multiline values enclosed in backticks (<code>`</code>):</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Api POST #addPet Add a new pet to the store
Url https://petstore.swagger.io/v2/pet
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON `
&#123;
  "id": &#123;&#123;newPetId&#125;&#125;,
  "name": "&#123;&#123;newPetName&#125;&#125;",
  "status": "available"
&#125;
`</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 2: Tasks and Steps</h2>
          <p>
            Once your APIs are declared, you use <strong>Tasks</strong> to define the sequence of execution. A <code>Task</code> contains one or more <code>Step</code>s that call the declared APIs.
          </p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Task [Task Description / Title]
  Step Call Api &lt;ApiName&gt; [Optional Step Title]</code></pre>
          
          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">2.1 Basic Task Example</h3>
          <p>Here, we create a task that executes the <code>#addPet</code> API declared in Step 1:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Task Register New Pet
  Step Call Api addPet</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 3: Variables and Environments</h2>
          <p>
            To make workflows dynamic, you can define variables. In Berry, variables are declared in blocks using the <code>Var</code> keyword.
          </p>
          
          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">3.1 Global Variables</h3>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Var AppConfig
- newPetId: 9988
- newPetName: "Sherlock"</code></pre>

          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">3.2 Environment-Specific Variables (@Pointer)</h3>
          <p>You can use the <code>@</code> pointer symbol to define variables that only apply to a specific environment (e.g. UAT or Production):</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Var @UAT Configuration settings for User Acceptance Testing
- baseUrl: "https://uat-api.petstore.io/v2"
- apiKey: "uat-secret-token"

Var @PROD Production endpoint details
- baseUrl: "https://api.petstore.io/v2"
- apiKey: "prod-live-token"</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 4: Dynamic Data Capturing</h2>
          <p>
            A workflow often requires taking data from a previous API response and passing it to the next API call. You can extract values using the <code>Capture</code> block inside a <code>Step</code>.
          </p>
          
          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">4.1 Capturing Response Data</h3>
          <p>We use the <code>response</code> keyword to extract JSON fields from the API output:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Task Register and Verify Pet

  Step Call Api addPet
    Capture
    - generatedId: response.id
    - petStatus: response.status</code></pre>

          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">4.2 Passing Captured Values to the Next Step</h3>
          <p>To pass a captured value into a subsequent step's API call, use <code>Step.&lt;index&gt;.&lt;key&gt;</code> (where <code>&lt;index&gt;</code> is the 1-based index of the step within the task):</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Task Register and Verify Pet

  # Step 1: Register Pet
  Step Call Api addPet
    Capture
    - generatedId: response.id

  # Step 2: Fetch the registered Pet using the ID from Step 1
  Step Call Api getPetById
    Params
    - petId: Step.1.generatedId</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 5: Advanced Check Conditions (Assertions)</h2>
          <p>
            The <code>Check</code> block allows you to run assertions on status codes, response headers, and response payloads.
          </p>
          <h3 class="text-md font-semibold text-white font-mono mt-4 mb-2">5.1 Simple Checks</h3>
          <p>Berry supports standard comparison operators: <code>==</code>, <code>!=</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Step Call Api getPetById
  Check
  - $.status == 200            # $.status refers to the HTTP response status code
  - $.body != null             # $.body refers to the parsed JSON body</code></pre>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">Step 6: Encrypted Secrets (Decrypt)</h2>
          <p>
            Storing plain-text passwords or secret keys in source files is a security risk. Berry offers native variable decryption via the <code>Decrypt</code> keyword.
          </p>
          <p>Simply add the <code>Decrypt</code> flag at the end of a variable declaration line:</p>
          <pre class="bg-gray-900 border border-white/5 rounded-xl p-4 overflow-x-auto text-xs my-2 font-mono text-emerald-300"><code>Var SecureConfig
- adminPassword: 'cGFzc3dvcmQxMjM=' Decrypt</code></pre>
          <p class="mt-4">
            By default, the engine uses <strong>Base64</strong> decryption. However, you can pass a custom <code>decryptionProvider</code> programmatically to support KMS, Vault, or AES decryption.
          </p>
        </div>

      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
