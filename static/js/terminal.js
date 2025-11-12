// Terminal Widget - Interactive Terminal for Terminal Blog
// Author: Terminal Blog Team

class TerminalWidget {
  constructor() {
    this.terminal = document.getElementById("terminalWidget");
    this.output = document.getElementById("terminalOutput");
    this.input = document.getElementById("terminalInput");
    this.toggleBtn = document.getElementById("terminalToggle");
    this.closeBtn = document.getElementById("terminalClose");

    this.commandHistory = [];
    this.historyIndex = -1;
    this.isOpen = false;

    this.waitingForInput = null; // Track what we're waiting for
    this.inputBuffer = ""; // Store partial input

    // Available commands
    this.commands = {
      help: this.cmdHelp.bind(this),
      clear: this.cmdClear.bind(this),
      ls: this.cmdLs.bind(this),
      posts: this.cmdPosts.bind(this),
      cat: this.cmdCat.bind(this),
      whoami: this.cmdWhoami.bind(this),
      status: this.cmdStatus.bind(this),
      about: this.cmdAbout.bind(this),
      contact: this.cmdContact.bind(this),
      social: this.cmdSocial.bind(this),
      date: this.cmdDate.bind(this),
      echo: this.cmdEcho.bind(this),
      theme: this.cmdTheme.bind(this),
      secret: this.cmdSecret.bind(this),
      weather: this.cmdWeather.bind(this),
    };

    this.init();
  }

  init() {
    // Toggle button
    this.toggleBtn.addEventListener("click", () => this.toggle());
    this.closeBtn.addEventListener("click", () => this.close());

    // Input handling
    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Keyboard shortcut: Ctrl + ~
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        this.toggle();
      }
    });

    // Auto-scroll output
    this.output.addEventListener("DOMNodeInserted", () => {
      this.output.scrollTop = this.output.scrollHeight;
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.terminal.classList.remove("hidden");
    this.toggleBtn.classList.add("active");
    this.isOpen = true;
    setTimeout(() => this.input.focus(), 300);
  }

  close() {
    this.terminal.classList.add("hidden");
    this.toggleBtn.classList.remove("active");
    this.isOpen = false;
  }

  handleKeyDown(e) {
    // Check if we're waiting for special input
    if (this.waitingForInput) {
      this.handleSpecialInput(e);
      return;
    }

    // Normal command handling
    if (e.key === "Enter") {
      e.preventDefault();
      this.executeCommand(this.input.value.trim());
      this.input.value = "";
      this.historyIndex = -1;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.navigateHistory("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.navigateHistory("down");
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.autocomplete();
    }
  }

  handleSpecialInput(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = this.input.value.trim();

      // Show what user typed
      this.printLine(
        `City: <span style="color: var(--terminal-cyan);">${input || "Gangtok"}</span>`,
      );
      this.printLine("");

      // Handle based on what we're waiting for
      if (this.waitingForInput === "weather") {
        this.fetchWeather(input);
      }

      // Reset state
      this.waitingForInput = null;
      this.input.value = "";
    } else if (e.key === "Escape") {
      // Cancel input
      e.preventDefault();
      this.printLine("");
      this.printLine("❌ Cancelled", "terminal-error");
      this.printLine("");
      this.waitingForInput = null;
      this.input.value = "";
    }
  }
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;

    if (direction === "up") {
      if (this.historyIndex < this.commandHistory.length - 1) {
        this.historyIndex++;
        this.input.value =
          this.commandHistory[
            this.commandHistory.length - 1 - this.historyIndex
          ];
      }
    } else {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value =
          this.commandHistory[
            this.commandHistory.length - 1 - this.historyIndex
          ];
      } else {
        this.historyIndex = -1;
        this.input.value = "";
      }
    }
  }

  autocomplete() {
    const partial = this.input.value.toLowerCase();
    if (!partial) return;

    const matches = Object.keys(this.commands).filter((cmd) =>
      cmd.startsWith(partial),
    );

    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.printLine(`Available: ${matches.join(", ")}`, "terminal-info");
    }
  }

  executeCommand(commandLine) {
    if (!commandLine) return;

    // Add to history
    this.commandHistory.push(commandLine);

    // Show command
    this.printLine(`$ ${commandLine}`, "terminal-command");

    // Parse command and args
    const parts = commandLine.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Execute command
    if (this.commands[command]) {
      this.commands[command](args);
    } else {
      this.printLine(
        `Command not found: ${command}. Type 'help' for available commands.`,
        "terminal-error",
      );
    }
  }

  printLine(text, className = "terminal-text") {
    const line = document.createElement("div");
    line.className = "terminal-line";

    const textSpan = document.createElement("span");
    textSpan.className = className;
    textSpan.innerHTML = text;

    line.appendChild(textSpan);
    this.output.appendChild(line);
  }

  // ========== COMMANDS ==========

  cmdHelp() {
    this.printLine("Available commands:", "terminal-success");
    this.printLine("");
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">help</span>      - Show this help message',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">clear</span>     - Clear the terminal',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">ls</span>        - List all blog posts',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">posts</span>     - List recent posts',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">cat [id]</span>  - View post details (e.g., cat 1)',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">whoami</span>    - Display user info',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">about</span>     - About this blog',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">contact</span>   - Contact information',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">social</span>    - Social media links',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">status</span>    - System status',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">date</span>      - Show current date',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">echo [text]</span> - Print text',
    );
    this.printLine(
      '  <span style="color: var(--terminal-cyan);">weather</span>    - Todays weather',
    );
    this.printLine("");
    this.printLine("💡 Tip: Use ↑/↓ arrows for history, Tab for autocomplete");
  }

  cmdClear() {
    this.output.innerHTML = "";
  }

  async cmdLs() {
    this.printLine("Fetching posts...", "terminal-info");

    try {
      // Fetch posts from your Flask backend
      const response = await fetch("/api/posts");
      const posts = await response.json();

      this.printLine("");
      this.printLine(`Found ${posts.length} posts:`, "terminal-success");
      this.printLine("");

      posts.forEach((post) => {
        this.printLine(
          `  <span style="color: var(--terminal-green);">[${post.id}]</span> ${post.title} <span style="color: var(--terminal-text-dim);">(${post.date})</span>`,
        );
      });

      this.printLine("");
      this.printLine(`Use 'cat [id]' to read a post.`, "terminal-info");
    } catch (error) {
      this.printLine(
        "Error fetching posts. Using cached data...",
        "terminal-error",
      );
      // Fallback to static data
      this.printLine("");
      this.printLine("  [1] Sample Post 1");
      this.printLine("  [2] Sample Post 2");
    }
  }

  cmdPosts() {
    this.cmdLs(); // Alias for ls
  }

  cmdCat(args) {
    if (args.length === 0) {
      this.printLine("Usage: cat [post_id]", "terminal-error");
      this.printLine("Example: cat 1", "terminal-info");
      return;
    }

    const postId = args[0];
    this.printLine(`Opening post #${postId}...`, "terminal-success");
    this.printLine(
      `<a href="/post/${postId}" class="terminal-link" onclick="window.location.href='/post/${postId}';">Click here to read the full post</a>`,
    );
  }

  async cmdWhoami() {
    this.printLine("Fetching user info...", "terminal-info");

    try {
      const response = await fetch("/api/user");
      const user = await response.json();

      this.printLine(""); // Clear the "Fetching..." line visually

      if (user.isAuthenticated) {
        // Logged in user
        this.printLine("=".repeat(50), "terminal-green");
        this.printLine("  👤 USER INFORMATION", "terminal-success");
        this.printLine("=".repeat(50), "terminal-green");
        this.printLine("");
        this.printLine(
          `  Name:     <span style="color: var(--terminal-cyan);">${user.name}</span>`,
        );
        this.printLine(
          `  Email:    <span style="color: var(--terminal-cyan);">${user.email}</span>`,
        );
        this.printLine(
          `  User ID:  <span style="color: var(--terminal-cyan);">#${user.id}</span>`,
        );
        this.printLine(
          `  Role:     <span style="color: var(--terminal-cyan);">${user.isAdmin ? "Administrator" : "Member"}</span>`,
        );
        this.printLine(
          `  Status:   <span style="color: var(--terminal-green);">● Active</span>`,
        );
        this.printLine("");

        if (user.isAdmin) {
          this.printLine(
            '  🔑 Admin Privileges: <span style="color: var(--terminal-yellow);">ENABLED</span>',
          );
          this.printLine("     • Create new posts");
          this.printLine("     • Edit all posts");
          this.printLine("     • Delete posts");
          this.printLine("     • Moderate comments");
          this.printLine("");
        } else {
          this.printLine("  💬 Permissions:");
          this.printLine("     • Comment on posts");
          this.printLine("     • Read all content");
          this.printLine("");
        }

        this.printLine("  Quick Actions:");
        this.printLine(
          '     • <a href="/logout" class="terminal-link">Logout</a>',
        );
        if (user.isAdmin) {
          this.printLine(
            '     • <a href="/new-post" class="terminal-link">Create New Post</a>',
          );
        }
      } else {
        // Guest user
        this.printLine("=".repeat(50), "terminal-yellow");
        this.printLine("  👤 GUEST USER", "terminal-info");
        this.printLine("=".repeat(50), "terminal-yellow");
        this.printLine("");
        this.printLine(
          '  User:     <span style="color: var(--terminal-text-dim);">visitor@terminal-blog</span>',
        );
        this.printLine(
          '  Role:     <span style="color: var(--terminal-text-dim);">Guest User</span>',
        );
        this.printLine(
          '  Status:   <span style="color: var(--terminal-yellow);">● Limited Access</span>',
        );
        this.printLine(
          '  Session:  <span style="color: var(--terminal-text-dim);">Temporary</span>',
        );
        this.printLine("");
        this.printLine("  ⚠️  Guest users can only read content.");
        this.printLine("");
        this.printLine("  Want to comment and engage?");
        this.printLine(
          '     • <a href="/register" class="terminal-link">Register</a> - Create new account',
        );
        this.printLine(
          '     • <a href="/login" class="terminal-link">Login</a> - Sign in to existing account',
        );
      }

      this.printLine("");
    } catch (error) {
      this.printLine("❌ Failed to fetch user information.", "terminal-error");
      console.error(error);
    }
  }

  async cmdStatus() {
    try {
      const response = await fetch("/api/user");
      const user = await response.json();

      this.printLine("🖥️  SYSTEM STATUS", "terminal-success");
      this.printLine("=".repeat(50), "terminal-green");
      this.printLine("");
      this.printLine(
        `  Server:        <span style="color: var(--terminal-green);">● Online</span>`,
      );
      this.printLine(
        `  Database:      <span style="color: var(--terminal-green);">● Connected</span>`,
      );
      this.printLine(
        `  User Session:  <span style="color: ${user.isAuthenticated ? "var(--terminal-green)" : "var(--terminal-yellow)"};">● ${user.isAuthenticated ? "Authenticated" : "Guest"}</span>`,
      );
      this.printLine(
        `  Terminal:      <span style="color: var(--terminal-green);">● Active</span>`,
      );
      this.printLine("");

      if (user.isAuthenticated) {
        this.printLine(
          `  Logged in as:  <span style="color: var(--terminal-cyan);">${user.name}</span>`,
        );
      } else {
        this.printLine("  💡 Tip: Login for full access!");
        this.printLine(
          '     • <a href="/register" class="terminal-link">Register</a> - Create new account',
        );
        this.printLine(
          '     • <a href="/login" class="terminal-link">Login</a> - Sign in to existing account',
        );
      }
    } catch (error) {
      this.printLine("❌ Failed to fetch status.", "terminal-error");
      console.error(error);
    }
  }
  cmdAbout() {
    this.printLine("=".repeat(50), "terminal-green");
    this.printLine("  🚀 TERMINAL BLOG", "terminal-success");
    this.printLine("=".repeat(50), "terminal-green");
    this.printLine("");
    this.printLine("A terminal-themed developer blog focused on:");
    this.printLine("  • Technology & Programming");
    this.printLine("  • Space & Science");
    this.printLine("  • Productivity & Life Hacks");
    this.printLine("");
    this.printLine("Built with Flask, Python, and lots of ☕");
    this.printLine("");
    this.printLine('<a href="/about" class="terminal-link">Learn more →</a>');
  }

  cmdContact() {
    this.printLine("📧 Contact Information:", "terminal-success");
    this.printLine("");
    this.printLine("  Email: contact@terminal-blog.com");
    this.printLine("  GitHub: github.com/lazy-blake");
    this.printLine("");
    this.printLine(
      '<a href="/contact" class="terminal-link">Send us a message →</a>',
    );
  }

  cmdSocial() {
    this.printLine("🔗 Follow us:", "terminal-success");
    this.printLine("");
    this.printLine(
      '  <a href="https://github.com/lazy-blake" class="terminal-link" target="_blank">GitHub</a>',
    );
    this.printLine('  <a href="#" class="terminal-link">Twitter</a>');
    this.printLine('  <a href="#" class="terminal-link">LinkedIn</a>');
  }

  cmdDate() {
    const now = new Date();
    this.printLine(now.toString(), "terminal-info");
  }

  async cmdWeather(args) {
    // If city provided as argument, use it directly
    if (args.length > 0) {
      const city = args.join(" ");
      await this.fetchWeather(city);
      return;
    }

    // Create interactive prompt
    this.printLine("=".repeat(50), "terminal-cyan");
    this.printLine("  🌍 WEATHER LOOKUP", "terminal-success");
    this.printLine("=".repeat(50), "terminal-cyan");
    this.printLine("");
    this.printLine("Enter city name:", "terminal-info");
    this.printLine(
      '<span style="color: var(--terminal-text-dim);">(Press Enter for default: Gangtok)</span>',
    );
    this.printLine(
      '<span style="color: var(--terminal-text-dim);">(Press Esc to cancel)</span>',
    );
    this.printLine("");

    // Set waiting state
    this.waitingForInput = "weather";

    // Show prompt indicator
    this.printLine(
      '🌆 <span style="color: var(--terminal-yellow);">Enter city</span> → <span class="terminal-cursor"></span>',
    );
  }
  async fetchWeather(city) {
    if (!city || city.trim() === "") {
      city = "Gangtok";
    }

    this.printLine(`Fetching weather for ${city}...`, "terminal-info");

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(city)}`,
      );

      if (!response.ok) {
        const data = await response.json();
        this.printLine("");
        this.printLine(
          `❌ ${data.message || "Failed to fetch weather"}`,
          "terminal-error",
        );
        return;
      }

      const data = await response.json();

      if (data.error) {
        this.printLine("");
        this.printLine(`❌ ${data.message}`, "terminal-error");
        this.printLine("");
        this.printLine(
          "Tip: Check spelling or try another city",
          "terminal-info",
        );
        return;
      }

      // Weather icons mapping for wttr.in codes
      const weatherEmojis = {
        113: "☀️", // Sunny
        116: "⛅", // Partly cloudy
        119: "☁️", // Cloudy
        122: "☁️", // Overcast
        143: "🌫️", // Mist
        176: "🌦️", // Patchy rain possible
        200: "⛈️", // Thundery outbreaks
        248: "🌫️", // Fog
        293: "🌧️", // Patchy light rain
        296: "🌧️", // Light rain
        302: "🌧️", // Moderate rain
        308: "🌧️", // Heavy rain
        323: "❄️", // Patchy light snow
        326: "❄️", // Light snow
        332: "❄️", // Moderate snow
        338: "❄️", // Heavy snow
        386: "⛈️", // Patchy light rain with thunder
        389: "⛈️", // Moderate or heavy rain with thunder
      };

      const emoji = weatherEmojis[data.icon] || "🌡️";

      // Display weather
      this.printLine("");
      this.printLine("=".repeat(50), "terminal-cyan");
      this.printLine(`  ${emoji} WEATHER REPORT`, "terminal-success");
      this.printLine("=".repeat(50), "terminal-cyan");
      this.printLine("");
      this.printLine(
        `  📍 Location:    <span style="color: var(--terminal-cyan);">${data.city}, ${data.country}</span>`,
      );
      this.printLine(
        `  🌡️  Temperature: <span style="color: var(--terminal-green);">${data.temp}°C</span> (feels like ${data.feels_like}°C)`,
      );
      this.printLine(
        `  ☁️  Conditions:  <span style="color: var(--terminal-yellow);">${data.description}</span>`,
      );
      this.printLine(`  💧 Humidity:    ${data.humidity}%`);
      this.printLine(`  💨 Wind Speed:  ${data.wind_speed} km/h`);
      this.printLine("");

      // Add weather advice
      if (data.temp > 30) {
        this.printLine(
          "  🔥 Hot! Stay hydrated and stay cool.",
          "terminal-yellow",
        );
      } else if (data.temp < 10) {
        this.printLine("  🧊 Cold! Bundle up and stay warm.", "terminal-cyan");
      } else if (data.description.toLowerCase().includes("rain")) {
        this.printLine("  ☔ Don't forget your umbrella!", "terminal-info");
      } else {
        this.printLine("  ✨ Perfect coding weather!", "terminal-success");
      }

      this.printLine("");
    } catch (error) {
      this.printLine("");
      this.printLine("❌ Failed to fetch weather data.", "terminal-error");
      this.printLine(`Error: ${error.message}`, "terminal-info");
      console.error("Weather fetch error:", error);
    }
  }
  cmdEcho(args) {
    if (args.length === 0) {
      this.printLine("");
    } else {
      this.printLine(args.join(" "));
    }
  }

  cmdTheme() {
    this.printLine("Current theme: Dark Terminal", "terminal-success");
    this.printLine("");
    this.printLine("🎨 Theme settings:");
    this.printLine("  Primary: Terminal Green (#00ff41)");
    this.printLine("  Secondary: Cyan (#00d9ff)");
    this.printLine("  Background: Dark (#0a0e14)");
  }

  cmdSecret() {
    this.printLine("🎉 You found the secret command!", "terminal-success");
    this.printLine("");
    this.printLine("  .--.");
    this.printLine(" /.-. '.\\");
    this.printLine(" |  |   | |");
    this.printLine(" |  |   | |");
    this.printLine(" | /    | |");
    this.printLine(" ]/     |/");
    this.printLine("");
    this.printLine("Easter egg unlocked! 🥚", "terminal-cyan");
  }
}

// Initialize terminal when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.terminalWidget = new TerminalWidget();
  console.log(
    "%c[TERMINAL]%c Widget initialized",
    "color: #00ff41; font-weight: bold;",
    "color: #00d9ff;",
  );
});
