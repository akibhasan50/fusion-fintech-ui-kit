/**
 * theme-sync.js
 * Lightweight helper to synchronize the theme from the parent dashboard
 * to the component iframes using the URL hash (#dark or #light).
 */

(function() {
    function updateTheme() {
        const isDark = window.location.hash.includes('dark');
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Also try to sync any local checkbox toggles if they exist (legacy support)
        const darkToggle = document.getElementById('dark-toggle') || document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.checked = isDark;
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', updateTheme);
    
    // Initial check on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateTheme);
    } else {
        updateTheme();
    }
})();
