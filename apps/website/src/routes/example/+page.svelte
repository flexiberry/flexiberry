<script lang="ts">
  import { Navigation, Footer } from "$lib";

  // Predefined example codes
  const examples = [
    {
      id: "kitchen-sink",
      title: "Kitchen Sink",
      subtitle: "Full Language Capabilities",
      description:
        "Explore the comprehensive features of the Berry scripting language. This script showcases all available nodes, blocks, variable declarations, API definitions, data extraction, and logic assertions.",
      features: [
        "Variable pointers & secret decryption",
        "Multiple HTTP methods (GET, POST, PUT)",
        "Headers and Body payload interpolation",
        "Step-by-step stateful execution",
        "Cross-step variable references",
        "Complex logical check conditions (==, >=, OR)",
      ],
      code: `## ---------------------------------------------------------
## FLEXIBERRY KITCHEN SINK DEMONSTRATION FILE
## ---------------------------------------------------------
## This file showcases every syntax, token, and grammar rule 
## that the Berry compiler is capable of parsing.

Var @PROD Production Config
- envName: 'production'
- timeout_ms: 5000
- isDebug: false

Var DefaultUser
- username: 'admin_rintu'
- password: 'super_secret_password'

Api POST #authenticateUser Login to the system
Url https://api.example.com/v1/auth/login
Header
- Content-Type: 'application/json'
- Accept: 'application/json'
Body JSON \`
{
  "username": "{{username}}",
  "password": "{{password}}"
}
\`

Api GET #getUserProfile Fetch the user data
Url https://api.example.com/v1/users/{{userId}}
Header
- Authorization: 'Bearer {{authToken}}'
- Accept: 'application/json'

Api PUT #updateUser Update user status
Url https://api.example.com/v1/users/{{userId}}
Header
- Content-Type: 'application/json'
- Authorization: 'Bearer {{authToken}}'
Body JSON \`
{
  "status": "active",
  "preferences": {
    "notifications": true
  }
}
\`

Task Complete User Lifecycle Flow

  Step Call Api authenticateUser
    Params
    - username: username
    - password: password
    Capture
    - authToken: response.token
    - returnedUserId: response.user.id
    Check
    - $.status == 200 OR $.status == 201
    - Step.1.authToken != null

  Step Call Api getUserProfile
    Params
    - userId: Step.1.returnedUserId
    - authToken: Step.1.authToken
    Capture
    - currentStatus: response.status
    Check
    - $.status == 200
    - response.username == DefaultUser.username

  Step Call Api updateUser
    Params
    - userId: Step.1.returnedUserId
    - authToken: Step.1.authToken
    Check
    - $.status >= 200
    - $.status < 300
    - response.status == 'active'
`,
    },
    {
      id: "petstore",
      title: "Pet Store Flow",
      subtitle: "Real-world API Sequence",
      description:
        "A complete integration test flow calling the standard Swagger Petstore API. It creates a pet using a POST request, captures its auto-generated ID, and uses it to execute a verification GET request.",
      features: [
        "Real API endpoints integration",
        "POST request with raw JSON body",
        "Auto-generated ID extraction",
        "GET request with path parameters",
        "Response status validation",
        "Asserting response equality across steps",
      ],
      code: `## ---------------------------------------------------------
## SWAGGER PETSTORE SEQUENCE EXAMPLE
## ---------------------------------------------------------

Var @UAT Petstore Settings
- baseUrl: 'https://petstore.swagger.io/v2'
- petId: '987654321'

Api POST #addPet Add a new pet to the store
Url {{baseUrl}}/pet
Header
- Content-Type: 'application/json'
Body JSON \`
{
  "id": {{petId}},
  "category": {
    "id": 0,
    "name": "string"
  },
  "name": "BerryDoggie",
  "photoUrls": [
    "string"
  ],
  "tags": [
    {
      "id": 0,
      "name": "active-test"
    }
  ],
  "status": "available"
}
\`

Api GET #getPetById Find pet by ID
Url {{baseUrl}}/pet/{{petId}}
Header
- Accept: 'application/json'

Task Add Pet and Find Sequence

  Step Call Api addPet
    Capture
    - createdId: response.id
    - createdName: response.name
    Check
    - $.status == 200 OR $.status == 201
    - response.id != null
    - response.name == 'BerryDoggie'

  Step Call Api getPetById
    Params
    - petId: Step.1.createdId
    Capture
    - petName: response.name
    Check
    - $.status == 200
    - response.name == Step.1.createdName
`,
    },
    {
      id: "auth-decryption",
      title: "Secure Auth Flow",
      subtitle: "Pointers & Decryption",
      description:
        "Demonstrates advanced security patterns including credential decryption and clean global environment pointers. Perfect for UAT and production testing containing encrypted API secrets.",
      features: [
        "Secret environment configuration pointers",
        "Base64 secret decryption logic",
        "API Authorization header injection",
        "Clean assertions on secret fields",
        "Production environment overrides",
      ],
      code: `## ---------------------------------------------------------
## SECURE AUTHENTICATION & DECRYPTION FLOW
## ---------------------------------------------------------

Var @UAT SecureConfig
- name: 'Integrator'
- apiKeyEncrypted: 'U0ZMVVdFUkJFUlJZMjAyNg==' Decrypt

Api POST #validateSecureGateway Secure connection
Url https://httpbin.org/post
Header
- Content-Type: 'application/json'
- X-API-KEY: '{{SecureConfig.apiKeyEncrypted}}'
Body JSON \`
{
  "sender": "{{SecureConfig.name}}",
  "secure": true
}
\`

Task Secure Endpoint Verification

  Step Call Api validateSecureGateway
    Params
    - name: SecureConfig.name
    - apiKeyEncrypted: SecureConfig.apiKeyEncrypted
    Capture
    - parsedKey: response.headers.X-Api-Key
    - receivedSender: response.json.sender
    Check
    - $.status == 200
    - response.headers.X-Api-Key == SecureConfig.apiKeyEncrypted
    - response.json.sender == 'Integrator'
`,
    },
  ];

  let activeTab = $state("kitchen-sink");
  let activeExample = $derived(
    examples.find((e) => e.id === activeTab) || examples[0],
  );

  // Self-contained syntax highlighter helper
  function highlightLine(line: string) {
    const trimmed = line.trim();
    if (trimmed.startsWith("##") || trimmed.startsWith("# ")) {
      return [{ text: line, type: "comment" }];
    }

    // Match common block structures
    const tokens: { text: string; type: string }[] = [];
    let remaining = line;

    // Detect indentation
    const indentMatch = remaining.match(/^(\s+)/);
    if (indentMatch) {
      tokens.push({ text: indentMatch[1], type: "indent" });
      remaining = remaining.substring(indentMatch[1].length);
    }

    // Parse simple line contents
    const words = remaining.split(/(\s+)/);
    for (let i = 0; i < words.length; i++) {
      const part = words[i];
      const trimmedPart = part.trim();

      if (!trimmedPart) {
        tokens.push({ text: part, type: "whitespace" });
        continue;
      }

      // 1. Keywords
      if (
        /^(Var|Api|Url|Header|Body|JSON|Task|Step|Params|Capture|Check|Link|Decrypt)$/.test(
          trimmedPart,
        )
      ) {
        tokens.push({ text: part, type: "keyword" });
      }
      // 2. Methods
      else if (/^(GET|POST|PUT|DELETE)$/.test(trimmedPart)) {
        tokens.push({ text: part, type: "method" });
      }
      // 3. Pointers (@name)
      else if (trimmedPart.startsWith("@")) {
        tokens.push({ text: part, type: "pointer" });
      }
      // 4. Identifiers (#id)
      else if (trimmedPart.startsWith("#")) {
        tokens.push({ text: part, type: "id" });
      }
      // 5. Variables/Operators/Paths
      else if (/^(==|!=|>=|<=|>|<|OR|Or|or|Call)$/.test(trimmedPart)) {
        tokens.push({ text: part, type: "operator" });
      }
      // 6. Strings/Numbers
      else if (
        /^["'\`].*["'\`]$/.test(trimmedPart) ||
        /^\d+$/.test(trimmedPart)
      ) {
        tokens.push({ text: part, type: "value" });
      }
      // 7. List bullet
      else if (trimmedPart.startsWith("-")) {
        tokens.push({ text: part, type: "bullet" });
      }
      // 8. Key declarations
      else if (trimmedPart.endsWith(":")) {
        tokens.push({ text: part, type: "prop" });
      }
      // 9. Standard text
      else {
        tokens.push({ text: part, type: "text" });
      }
    }

    return tokens;
  }
</script>

<svelte:head>
  <title>Flexiberry · Examples</title>
  <meta
    name="description"
    content="Explore beautifully designed API integration tests written in Berry language. Copy templates or run directly in the playground."
  />
</svelte:head>

<div
  class="min-h-screen bg-gray-950 text-gray-100 font-mono flex flex-col justify-between"
>
  <div>
    <!-- Navigation header -->
    <Navigation />

    <!-- Hero Header -->
    <section class="relative pt-32 pb-12 overflow-hidden text-center">
      <!-- Gradient blobs -->
      <div class="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <div
          class="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-[100px]"
        ></div>
        <div
          class="absolute top-20 right-10 w-96 h-96 rounded-full bg-purple-500/10 blur-[100px]"
        ></div>
      </div>

      <!-- Grid overlay -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:40px_40px] z-0 pointer-events-none"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 max-width-1100 mx-auto px-6">
        <span
          class="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-4"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"
          ></span>
          Interactive Templates
        </span>
        <h1
          class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          Berry Language <span
            class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent"
            >Showcase</span
          >
        </h1>
        <p
          class="text-slate-400 max-w-lg mx-auto leading-relaxed text-sm md:text-base"
        >
          From simple single-step validations to enterprise-grade sequence tests
          with environment configurations and secret decryption.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-width-1200 mx-auto px-6 pb-24 relative z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Left panel: interactive description and specs -->
        <div class="lg:col-span-4 flex flex-col gap-6">
          <!-- Tab Navigation Cards -->
          <div
            class="flex flex-col gap-3 bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-4"
          >
            <h3
              class="text-xs text-slate-500 uppercase tracking-widest font-bold px-2 mb-1"
            >
              Select Scenario
            </h3>
            {#each examples as example}
              <button
                onclick={() => (activeTab = example.id)}
                class="w-full text-left flex flex-col gap-1.5 px-4 py-3 rounded-xl transition-all duration-200 border {activeTab ===
                example.id
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-white shadow-[0_0_20px_rgba(52,211,153,0.1)]'
                  : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'}"
              >
                <div class="flex items-center justify-between w-full">
                  <span class="font-bold text-sm">{example.title}</span>
                  {#if activeTab === example.id}
                    <span
                      class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                    ></span>
                  {/if}
                </div>
                <span
                  class="text-[0.7rem] text-slate-500 font-mono tracking-tight"
                  >{example.subtitle}</span
                >
              </button>
            {/each}
          </div>

          <!-- Feature Description Card -->
          <div
            class="bg-gray-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-5"
          >
            <div>
              <h3 class="text-base font-bold text-white mb-2">
                {activeExample.title}
              </h3>
              <p class="text-xs text-slate-400 leading-relaxed font-sans">
                {activeExample.description}
              </p>
            </div>

            <div class="border-t border-white/5 pt-4">
              <h4
                class="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-3"
              >
                Concepts Showcased
              </h4>
              <ul class="flex flex-col gap-2.5">
                {#each activeExample.features as feature}
                  <li
                    class="flex items-start gap-2 text-[0.72rem] text-slate-300 leading-normal"
                  >
                    <span class="text-emerald-400 mt-0.5 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <!-- Glowing Action Button -->
            <a
              href="/playground?preset={activeExample.id}"
              class="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-gray-950 font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(52,211,153,0.3)]"
            >
              Run in Playground
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M5.5 3L10.5 7.5L5.5 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Right panel: Syntax-Highlighted Code Viewer -->
        <div
          class="lg:col-span-8 bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden shadow-2xl"
        >
          <!-- Editor Title Bar -->
          <div
            class="flex items-center gap-2 px-5 py-3 bg-[#161b22] border-bottom border-white/5"
          >
            <div class="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
            <span
              class="ml-3 text-[0.7rem] text-slate-500 font-mono tracking-tight uppercase"
            >
              templates / {activeExample.id}.berry
            </span>
            <button
              class="ml-auto text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1.5 transition"
              onclick={() => {
                navigator.clipboard.writeText(activeExample.code);
              }}
              title="Copy code template"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" /><path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
              </svg>
              Copy
            </button>
          </div>

          <!-- Code Window -->
          <div
            class="overflow-x-auto p-6 font-mono text-[12.5px] leading-6 max-h-[620px] overflow-y-auto custom-scroll"
          >
            <div class="flex flex-col">
              {#each activeExample.code.split("\n") as line, idx}
                <div
                  class="flex items-start hover:bg-white/[0.02] transition-colors rounded px-1"
                >
                  <!-- Line number column -->
                  <span
                    class="w-8 text-right text-slate-600 text-[10px] pr-4 select-none mt-0.5"
                    >{idx + 1}</span
                  >
                  <!-- Highlighted line content -->
                  <span class="flex-1 whitespace-pre">
                    {#each highlightLine(line) as token}
                      {#if token.type === "comment"}
                        <span class="text-slate-500">{token.text}</span>
                      {:else}
                        <span
                          style="color: {token.type === 'keyword'
                            ? '#c084fc'
                            : token.type === 'method'
                              ? '#f97316'
                              : token.type === 'pointer'
                                ? '#f472b6'
                                : token.type === 'id'
                                  ? '#34d399'
                                  : token.type === 'operator'
                                    ? '#93c5fd'
                                    : token.type === 'value'
                                      ? '#fcd34d'
                                      : token.type === 'prop'
                                        ? '#93c5fd'
                                        : token.type === 'bullet'
                                          ? '#fb923c'
                                          : '#e5e7eb'}">{token.text}</span
                        >
                      {/if}
                    {/each}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>

<style>
  .max-width-1100 {
    max-width: 1100px;
  }
  .max-width-1200 {
    max-width: 1200px;
  }

  /* Scrollbar Customization */
  .custom-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
  }
  .custom-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(52, 211, 153, 0.3);
  }

  /* Smooth scale transformations */
  button,
  a {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
