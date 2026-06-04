<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-brand">
        <h2 class="footer-logo">LITERARY NOIR</h2>
        <p class="footer-tagline">The intersection of cinematic atmosphere and intellectual critique.</p>
      </div>
      
      <div class="footer-links">
        <div class="link-group">
          <h3>Navigation</h3>
          <RouterLink to="/">Homepage</RouterLink>
          <RouterLink to="/movies">Cinema</RouterLink>
          <RouterLink to="/books">Literature</RouterLink>
          <RouterLink to="/about">About Us</RouterLink>
        </div>
        
        <div class="link-group">
          <h3>Legal</h3>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/guidelines">Editorial Guidelines</RouterLink>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} Literary Noir. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--color-surface);
  color: var(--color-text-main);
  padding-top: 80px;
  margin-top: 80px;
  border-top: 1px solid var(--color-border);
}

.footer-content {
  display: flex;
  flex-direction: column;
  gap: 60px;
  margin-bottom: 60px;
}

@media (min-width: 768px) {
  .footer-content {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-brand {
  max-width: 400px;
}

.footer-logo {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.footer-tagline {
  color: var(--color-text-light);
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-style: italic;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-group h3 {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin-bottom: 8px;
}

.link-group a {
  font-family: var(--font-sans);
  color: var(--color-text-muted);
  font-size: 0.95rem;
  transition: color 0.2s;
}

.link-group a:hover {
  color: var(--color-text-main);
}

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding: 24px 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
