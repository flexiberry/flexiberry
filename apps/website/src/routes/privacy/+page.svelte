<script lang="ts">
  import { Navigation, Footer } from "$lib";
</script>

<svelte:head>
  <title>Privacy Policy · Flexiberry Compliance & Data Protection</title>
  <meta
    name="description"
    content="Read the official Privacy Policy for Flexiberry to understand how we collect, use, and safeguard your personal information and browser data."
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
        <span
          class="inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full mb-4"
        >
          Compliance Document
        </span>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Privacy <span class="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Policy</span>
        </h1>
        <p class="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-sm">
          Last updated: June 30, 2026. This policy outlines how Flexiberry handles user data, cookies, and ads.
        </p>
      </div>
    </section>

    <!-- Main Content Section -->
    <section class="max-w-3xl mx-auto px-6 pb-24 relative z-10 font-sans">
      <div class="prose prose-invert max-w-none text-slate-300 text-sm md:text-base leading-relaxed flex flex-col gap-8">
        
        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">1. Consent</h2>
          <p>
            By using our website (flexiberry.dev) and its services, you hereby consent to our Privacy Policy and agree to its terms.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">2. Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <p class="mt-4">
            If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">3. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul class="list-disc list-inside mt-2 flex flex-col gap-1.5 pl-4">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Send you emails if you sign up for updates</li>
            <li>Find and prevent fraud</li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">4. Log Files</h2>
          <p>
            flexiberry.dev follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and are a part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">5. Cookies and Web Beacons</h2>
          <p>
            Like any other website, flexiberry.dev uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">6. Google DoubleClick DART Cookie</h2>
          <p>
            Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to flexiberry.dev and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: 
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">
              https://policies.google.com/technologies/ads
            </a>.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">7. Our Advertising Partners</h2>
          <p>
            Some of the advertisers on our site may use cookies and web beacons. Our advertising partners include:
          </p>
          <ul class="list-disc list-inside mt-2 pl-4">
            <li>
              <strong>Google AdSense:</strong> You can read their privacy policy at 
              <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">
                https://policies.google.com/technologies/ads
              </a>.
            </li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">8. Third Party Privacy Policies</h2>
          <p>
            flexiberry.dev's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p class="mt-4">
            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
          </p>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">9. GDPR Data Protection Rights</h2>
          <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
          <ul class="list-disc list-inside mt-2 flex flex-col gap-1.5 pl-4">
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white font-mono mb-3 border-b border-white/5 pb-2">10. Children's Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p class="mt-4">
            flexiberry.dev does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </div>

      </div>
    </section>
  </div>

  <!-- Navigation Footer -->
  <Footer />
</div>
