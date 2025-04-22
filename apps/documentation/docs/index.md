# Flexiberry Documentation

Welcome to the Flexiberry Documentation!

<style>
@media (max-width: 700px) {
  .fb-grid {
    grid-template-columns: 1fr !important;
  }
}
.fb-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}
.fb-card {
  border: 1px solid #eaeaea;
  border-radius: 12px;
  padding: 2rem;
  /* background: #fafbfc; */
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}
.fb-link {
  /* color: #0070f3; */
  text-decoration: underline;
}
</style>

<div class="fb-grid">

<!-- Quick Start Card -->
<div class="fb-card">
  <h3>🚀 Quick Start</h3>
  <p>Get up and running with Flexiberry in minutes. Follow our simple guide to start building amazing things!</p>
  <a href="/quick-start" class="fb-link">Read Quick Start →</a>
</div>

<!-- Berry Documentation CLI Card -->
<div class="fb-card">
  <h3>🧰 CLI Documentation </h3>
  <p>Discover how to use the Berry CLI to generate, manage, and maintain your documentation efficiently.</p>
  <a href="/cli" class="fb-link">CLI Documentation →</a>
</div>

<!-- App Configuration Card -->
<div class="fb-card">
  <h3>⚙️ App Configuration</h3>
  <p>Learn how to configure your Flexiberry app for different environments and use cases.</p>
  <a href="/configuration" class="fb-link">App Configuration →</a>
</div>

<!-- (Optional) Placeholder for 4th Card -->
<div class="fb-card">
  <h3>.berry Language Documentation</h3>
  <p>Learn how to use the .berry language to write testcases.</p>
  <a href="/berry-language" class="fb-link">.berry Language →</a>
</div>

</div>
