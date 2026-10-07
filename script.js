/**
 * PORTFOLIO JAVASCRIPT CONTROLLER
 * Handles night mode / theme toggling with CSS media query detection,
 * mobile navigation drawer, and active section scroll tracking.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. NIGHT MODE & CSS MEDIA QUERY THEME DETECTION
    // --------------------------------------------------------------------------
    const headerToggleBtn = document.getElementById('theme-toggle');
    const heroToggleBtn = document.getElementById('hero-theme-toggle');
    const htmlElement = document.documentElement;

    // CSS Media query for detecting browser/OS default theme
    const mediaQueryDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('portfolio-theme');

    // If user has a saved preference, apply it.
    // Otherwise, respect CSS media query (defaulting to dark if query matches, light otherwise)
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Let CSS media query handle it natively, or set initial state
        const detectedTheme = mediaQueryDark.matches ? 'dark' : 'light';
        applyTheme(detectedTheme);
    }

    // Listen for live changes to the user's OS/browser theme preference
    mediaQueryDark.addEventListener('change', (e) => {
        // Only automatically switch if user hasn't explicitly set a preference
        if (!localStorage.getItem('portfolio-theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Theme toggle action handler
    function toggleCurrentTheme() {
        const currentTheme = htmlElement.getAttribute('data-theme') || (mediaQueryDark.matches ? 'dark' : 'light');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem('portfolio-theme', nextTheme);
    }

    // Attach click listeners to both theme toggle buttons (header & hero window)
    if (headerToggleBtn) {
        headerToggleBtn.addEventListener('click', toggleCurrentTheme);
    }

    if (heroToggleBtn) {
        heroToggleBtn.addEventListener('click', toggleCurrentTheme);
    }

    function applyTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);

        // Update header button accessibility
        if (headerToggleBtn) {
            headerToggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light (Day) Mode' : 'Switch to Night Mode');
            headerToggleBtn.setAttribute('aria-label', `Current theme is ${theme}. Click to toggle.`);
        }

        // Update hero button accessibility
        if (heroToggleBtn) {
            heroToggleBtn.setAttribute('title', theme === 'dark' ? 'Switch to Light (Day) Mode' : 'Switch to Night Mode');
            heroToggleBtn.setAttribute('aria-label', `Current theme is ${theme}. Click to toggle.`);
        }
    }

    // --------------------------------------------------------------------------
    // 2. MOBILE NAVIGATION DRAWER TOGGLE (Vertical Navbar)
    // --------------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const primaryNav = document.getElementById('primary-nav');
    const siteHeader = document.getElementById('site-header');

    if (mobileMenuBtn && primaryNav) {
        function closeMobileNav() {
            if (primaryNav.classList.contains('is-open')) {
                primaryNav.classList.remove('is-open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }

        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = primaryNav.classList.toggle('is-open');
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close mobile drawer when any navigation link is clicked
        const navLinks = primaryNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileNav();
            });
        });

        // Close when clicking outside header
        document.addEventListener('click', (e) => {
            if (siteHeader && !siteHeader.contains(e.target)) {
                closeMobileNav();
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
                closeMobileNav();
                mobileMenuBtn.focus();
            }
        });

        // Reset if window resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 960) {
                closeMobileNav();
            }
        });
    }

    // --------------------------------------------------------------------------
    // 3. ACTIVE NAVIGATION LINK ON SCROLL (INTERSECTION OBSERVER)
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // --------------------------------------------------------------------------
    // 4. SKILLS SECTION — TAB FILTER
    //    When a tab is clicked, hide cards whose data-category doesn't match.
    //    "all" shows every card.
    // --------------------------------------------------------------------------
    const skillTabs = document.querySelectorAll('.skill-tab');
    const skillCards = document.querySelectorAll('.skill-card');

    skillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;

            // Update ARIA state and active styling on all tabs
            skillTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Show/hide cards based on their data-category
            skillCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    // Remove hide flag and re-trigger entrance animation
                    card.removeAttribute('data-hide');
                    card.style.animation = 'none';
                    // Force reflow so animation replays
                    void card.offsetWidth;
                    card.style.animation = '';
                } else {
                    card.setAttribute('data-hide', 'true');
                }
            });
        });
    });

    // --------------------------------------------------------------------------
    // 5. SKILLS SECTION — ANIMATED PROGRESS BARS (Scroll Trigger)
    //    Each .ps-bar-fill has a data-width attribute (0–100).
    //    On first intersection, we set width: N% to trigger the CSS transition.
    // --------------------------------------------------------------------------
    const barFills = document.querySelectorAll('.ps-bar-fill');

    if (barFills.length > 0) {
        // Use IntersectionObserver so bars animate when they scroll into view
        const barObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate all bars in the visible card
                    barFills.forEach(fill => {
                        const targetWidth = fill.getAttribute('data-width') || '0';
                        // Small delay so the page layout settles first
                        setTimeout(() => {
                            fill.style.width = `${targetWidth}%`;
                        }, 150);
                    });
                    // Stop observing after first trigger (animate once)
                    barObserver.disconnect();
                }
            });
        }, {
            root: null,
            threshold: 0.3  // Fire when 30% of the card is visible
        });

        // Observe the wide language card that contains the progress bars
        const langCard = document.querySelector('.skill-card-wide');
        if (langCard) barObserver.observe(langCard);
    }

    // --------------------------------------------------------------------------
    // 6. INTERACTIVE AI CHAT CONTROLLER
    //    Simulates conversational interaction with an AI version of Sneha B B.
    //    Provides instant responses on education, skills, projects, and contact info,
    //    complete with typing indicators, quick prompt pills, and an API hook.
    // --------------------------------------------------------------------------
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const chatClearBtn = document.getElementById('chat-clear-btn');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');
    const sendBtn = document.getElementById('chat-send-btn');

    // Conversation history cache (useful for future multi-turn API integration)
    const chatHistory = [
        {
            role: 'assistant',
            content: "Hello! 👋 I'm Sneha's interactive AI assistant. Ask me anything about her studies in AIML at Adichunchanagiri Institute of Technology, her IoT Footstep Electricity project, or technical skills in Java, Python, and Machine Learning!"
        }
    ];

    if (chatForm && chatInput && chatMessages) {
        // Handle form submission
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const messageText = chatInput.value.trim();
            if (!messageText) return;

            processUserMessage(messageText);
            chatInput.value = '';
            chatInput.focus();
        });

        // Handle quick prompt chips
        if (suggestionChips.length > 0) {
            suggestionChips.forEach(chip => {
                chip.addEventListener('click', () => {
                    const prompt = chip.getAttribute('data-prompt');
                    if (prompt) {
                        processUserMessage(prompt);
                    }
                });
            });
        }

        // Handle clear / reset chat
        if (chatClearBtn) {
            chatClearBtn.addEventListener('click', () => {
                chatMessages.innerHTML = `
                    <div class="chat-msg chat-msg-bot">
                        <div class="msg-avatar" aria-hidden="true">
                            <span>🤖</span>
                        </div>
                        <div class="msg-body">
                            <div class="msg-author-meta">
                                <span class="msg-author-name">Sneha AI</span>
                                <span class="msg-time">Just now</span>
                            </div>
                            <div class="msg-bubble">
                                <p>Chat reset! 👋 How can I help you learn more about Sneha's projects, education, or skills?</p>
                            </div>
                        </div>
                    </div>
                `;
                chatHistory.length = 0;
                chatHistory.push({
                    role: 'assistant',
                    content: "Chat reset! 👋 How can I help you learn more about Sneha's projects, education, or skills?"
                });
            });
        }
    }

    /**
     * Appends a message bubble (user or bot) to the chat log
     */
    function appendChatMessage(role, htmlContent) {
        if (!chatMessages) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isBot = role === 'assistant' || role === 'bot';

        const msgEl = document.createElement('div');
        msgEl.className = isBot ? 'chat-msg chat-msg-bot' : 'chat-msg chat-msg-user';

        msgEl.innerHTML = `
            <div class="msg-avatar" aria-hidden="true">
                <span>${isBot ? '🤖' : '👤'}</span>
            </div>
            <div class="msg-body">
                <div class="msg-author-meta">
                    <span class="msg-author-name">${isBot ? 'Sneha AI' : 'You'}</span>
                    <span class="msg-time">${timeStr}</span>
                </div>
                <div class="msg-bubble">
                    ${htmlContent}
                </div>
            </div>
        `;

        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * Displays typing dots indicator
     */
    function setTyping(isTyping) {
        if (!typingIndicator || !chatMessages) return;

        if (isTyping) {
            typingIndicator.style.display = 'flex';
            // Move typing indicator to bottom of messages container
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            if (sendBtn) sendBtn.disabled = true;
        } else {
            typingIndicator.style.display = 'none';
            if (sendBtn) sendBtn.disabled = false;
        }
    }

    /**
     * Processes user message, displays it, triggers typing, and responds
     */
    function processUserMessage(rawText) {
        // Escape HTML to prevent injection from user input
        const cleanText = rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // 1. Render User Message
        appendChatMessage('user', `<p>${cleanText}</p>`);
        chatHistory.push({ role: 'user', content: rawText });

        // 2. Show Typing Indicator
        setTyping(true);

        // 3. Simulated Response Delay (600ms - 900ms) for natural feel
        const simulatedDelay = Math.floor(Math.random() * 300) + 600;

        setTimeout(() => {
            setTyping(false);

            // =========================================================================
            // API INTEGRATION POINT (e.g., OpenAI ChatGPT API / Anthropic / Gemini API)
            // =========================================================================
            // Currently, we use the local simulation engine: generateSimulatedReply(rawText).
            // To integrate a real OpenAI API in the future:
            //
            // 1. Set up a secure backend endpoint (Node.js, Next.js API, Express, or Serverless Function).
            //    NEVER expose your OpenAI API key directly inside client-side browser JavaScript.
            // 2. Replace this local call with:
            //
            //    fetchAIBackendResponse(rawText, chatHistory)
            //        .then(apiReplyHtml => {
            //            appendChatMessage('bot', apiReplyHtml);
            //            chatHistory.push({ role: 'assistant', content: apiReplyHtml });
            //        })
            //        .catch(err => {
            //            appendChatMessage('bot', "<p>Sorry, I encountered an issue connecting to the AI server. Please feel free to email Sneha at <a href='mailto:snehabasavaraj937@gmail.com'>snehabasavaraj937@gmail.com</a>!</p>");
            //        });
            //
            // See the full fetchAIBackendResponse implementation template below!
            // =========================================================================

            const botReplyHtml = generateSimulatedReply(rawText);
            appendChatMessage('bot', botReplyHtml);
            chatHistory.push({ role: 'assistant', content: botReplyHtml });
        }, simulatedDelay);
    }

    /**
     * Knowledge-based simulated response engine for Sneha B B's portfolio
     */
    function generateSimulatedReply(userText) {
        const q = userText.toLowerCase().trim();

        // 1. Education / College / Degree / School / Timeline
        if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('school') || q.includes('study') || q.includes('pursu') || q.includes('b.e') || q.includes('be') || q.includes('aiml') || q.includes('qualification') || q.includes('cgpa') || q.includes('mark') || q.includes('graduate') || q.includes('graduation')) {
            return `<p>Here is Sneha's verified educational background: 🎓</p>
            <ul>
                <li><strong>B.E. in AI &amp; Machine Learning (Current):</strong> Currently in 2nd year at <strong>Adichunchanagiri Institute of Technology (AIT)</strong>, graduating in <strong>2029</strong>.</li>
                <li><strong>Pre-University Course (Science):</strong> Vijaya Integrated PU College, Tumkur (completed in <strong>2025</strong>).</li>
                <li><strong>Secondary School (SSLC):</strong> Vidhyavahini Vidhyanikethana School, Bagur (completed in <strong>2023</strong> with distinction, <strong>93.44% CGPA</strong>).</li>
            </ul>
            <p>You can also explore the visual <strong><a href="#timeline">Academic Timeline</a></strong> section above!</p>`;
        }

        // 2. Footstep Electricity / Projects / IoT / Hardware
        if (q.includes('project') || q.includes('footstep') || q.includes('electric') || q.includes('iot') || q.includes('arduino') || q.includes('sensor') || q.includes('piezo') || q.includes('hardware')) {
            return `<p>One of Sneha's premier engineering projects is the <strong>Footstep Electricity Generation System</strong>! ⚡</p>
            <p>It's a clean-tech IoT prototype that harvests kinetic energy from footsteps using <strong>piezoelectric transducers</strong> and an <strong>Arduino microcontroller</strong> to generate and store electrical power for practical use.</p>
            <p>She also develops scalable software algorithms in <strong>Java</strong> and <strong>Python</strong>. Check out the <strong><a href="#projects">Projects Section</a></strong> for detailed breakdowns!</p>`;
        }

        // 3. Technical Skills / Programming Languages / AI Stack
        if (q.includes('skill') || q.includes('language') || q.includes('python') || q.includes('java') || q.includes('stack') || q.includes('tech') || q.includes('c++') || q.includes('sql') || q.includes('pytorch') || q.includes('tensorflow') || q.includes('ml') || q.includes('deep learning')) {
            return `<p>Sneha's core competencies span software, intelligent systems, and hardware: 💻</p>
            <ul>
                <li><strong>Languages:</strong> Python, Java, C/C++, SQL, JavaScript</li>
                <li><strong>AI &amp; Data:</strong> Machine Learning, Deep Learning, NLP, Generative AI, PyTorch, TensorFlow, scikit-learn, OpenCV, Pandas, NumPy</li>
                <li><strong>Hardware &amp; IoT:</strong> Arduino microcontrollers, piezoelectric sensors, circuit design</li>
                <li><strong>Tools:</strong> Git, GitHub, VS Code, Jupyter Notebooks, Google Colab</li>
            </ul>`;
        }

        // 4. Contact / Email / Phone / Socials
        if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('call') || q.includes('reach') || q.includes('touch') || q.includes('linkedin') || q.includes('github') || q.includes('message')) {
            return `<p>You can get in touch with Sneha directly: 📬</p>
            <ul>
                <li><strong>Email:</strong> <a href="mailto:snehabasavaraj937@gmail.com">snehabasavaraj937@gmail.com</a></li>
                <li><strong>Phone:</strong> <a href="tel:+918618728687">+91 8618728687</a></li>
                <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/sneha-b-b-74249a441" target="_blank">linkedin.com/in/sneha-b-b-74249a441</a></li>
                <li><strong>GitHub:</strong> <a href="https://github.com/snehabb14" target="_blank">github.com/snehabb14</a></li>
                <li><strong>Location:</strong> Karnataka, India</li>
            </ul>
            <p>Or submit a message through the <strong><a href="#contact">Contact form</a></strong> right below!</p>`;
        }

        // 5. Internship / Hiring / Job Opportunities
        if (q.includes('hire') || q.includes('job') || q.includes('intern') || q.includes('opportunity') || q.includes('role') || q.includes('work with') || q.includes('available')) {
            return `<p>Yes! Sneha is actively interested in <strong>internships and junior engineering opportunities</strong> in: 💼</p>
            <ul>
                <li>Software Development (Java, Python, C++)</li>
                <li>AI &amp; Machine Learning Engineering</li>
                <li>Embedded IoT &amp; Physical Prototyping</li>
            </ul>
            <p>Feel free to reach out via <a href="mailto:snehabasavaraj937@gmail.com">email</a> or grab her <a href="Sneha_BB_Resume.pdf" download target="_blank">Resume PDF</a>!</p>`;
        }

        // 6. Resume / CV
        if (q.includes('resume') || q.includes('cv') || q.includes('pdf')) {
            return `<p>You can download Sneha's official resume here: 📄</p>
            <p><a href="Sneha_BB_Resume.pdf" download class="project-btn" style="display:inline-flex;padding:6px 14px;margin-top:6px;">Download Sneha_BB_Resume.pdf</a></p>`;
        }

        // 7. Identity / Greetings
        if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('morning') || q.includes('evening') || q.includes('namaste')) {
            return `<p>Hello there! 😊 It's great to connect with you. I am Sneha's portfolio AI assistant. Feel free to ask about her academic degree in AIML, engineering projects, programming stack, or how to get in touch!</p>`;
        }

        if (q.includes('who are you') || q.includes('what are you') || q.includes('about yourself') || q.includes('who is sneha')) {
            return `<p>I am the <strong>AI twin of Sneha B B</strong> — an aspiring Software Engineer and AIML student from Karnataka, India. 👩‍💻</p>
            <p>She specializes in Java and Python software development, intelligent algorithms, and IoT engineering. Ask me anything about her work!</p>`;
        }

        if (q.includes('thank') || q.includes('thanks') || q.includes('awesome') || q.includes('great') || q.includes('cool')) {
            return `<p>You're very welcome! Feel free to ask more questions or scroll through the portfolio to see her projects in action. Have a wonderful day! ✨</p>`;
        }

        // 8. Helpful Fallback
        return `<p>Thanks for your question! As Sneha's AI assistant, I can share information about:</p>
        <ul>
            <li>🎓 <strong>Education:</strong> Her B.E. in AIML at AIT (graduating 2029), PU College, and SSLC distinction.</li>
            <li>⚡ <strong>Projects:</strong> Footstep Electricity Generation with Arduino &amp; Piezo sensors.</li>
            <li>💻 <strong>Skills:</strong> Python, Java, Machine Learning, Deep Learning, SQL, and Web dev.</li>
            <li>📬 <strong>Contact:</strong> How to reach Sneha for internships or collaborations.</li>
        </ul>
        <p>What would you like to know more about?</p>`;
    }

    /*
     * =========================================================================
     * FUTURE OPENAI API INTEGRATION FUNCTION TEMPLATE
     * =========================================================================
     * To connect an OpenAI API endpoint, implement this function on your server/backend:
     *
     * async function fetchAIBackendResponse(userPrompt, conversationHistory) {
     *     // Replace '/api/chat' with your backend route
     *     const response = await fetch('/api/chat', {
     *         method: 'POST',
     *         headers: {
     *             'Content-Type': 'application/json',
     *         },
     *         body: JSON.stringify({
     *             model: 'gpt-4o-mini', // or gpt-3.5-turbo
     *             messages: [
     *                 {
     *                     role: 'system',
     *                     content: `You are Sneha AI, a friendly and professional AI twin representing Sneha B B.
     *                               Sneha is an engineering student pursuing B.E. in AIML at Adichunchanagiri Institute of Technology (2025-2029).
     *                               She built the Footstep Electricity Generation prototype with Arduino and piezoelectric sensors.
     *                               Her skills include Java, Python, C++, SQL, Machine Learning, Deep Learning, and Arduino.
     *                               Contact: snehabasavaraj937@gmail.com, phone: +91 8618728687.
     *                               Always be polite, enthusiastic, and provide concise, helpful answers.`
     *                 },
     *                 ...conversationHistory,
     *                 { role: 'user', content: userPrompt }
     *             ]
     *         })
     *     });
     *
     *     if (!response.ok) {
     *         throw new Error(`Server returned ${response.status}`);
     *     }
     *
     *     const data = await response.json();
     *     // Return response text (or Markdown parsed to HTML)
     *     return data.choices[0].message.content;
     * }
     * =========================================================================
     */

    // --------------------------------------------------------------------------
    // 7. CONTACT FORM CONTROLLER & RESEND API HOOK
    //    Handles validation, submission loading states, success confirmation,
    //    and provides clear comments for integrating with Resend email service.
    // --------------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const contactNameInput = document.getElementById('contact-name');
    const contactEmailInput = document.getElementById('contact-email');
    const contactMessageInput = document.getElementById('contact-message');
    const contactSubmitBtn = document.getElementById('contact-submit-btn');
    const contactSuccessCard = document.getElementById('contact-success-msg');
    const contactResetBtn = document.getElementById('contact-reset-btn');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');
    const successNameDisplay = document.getElementById('success-name-display');
    const successEmailDisplay = document.getElementById('success-email-display');

    if (contactForm) {
        // Clear errors on input
        [contactNameInput, contactEmailInput, contactMessageInput].forEach(input => {
            if (!input) return;
            input.addEventListener('input', () => {
                const wrapper = input.closest('.form-input-wrapper');
                if (wrapper) wrapper.classList.remove('has-error');
                const errSpan = input.closest('.form-group')?.querySelector('.form-error-msg');
                if (errSpan) errSpan.textContent = '';
            });
        });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const name = contactNameInput.value.trim();
            const email = contactEmailInput.value.trim();
            const message = contactMessageInput.value.trim();

            // Validate Name
            if (!name || name.length < 2) {
                isValid = false;
                showFieldError(contactNameInput, nameError, 'Please enter your full name (at least 2 characters).');
            }

            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                isValid = false;
                showFieldError(contactEmailInput, emailError, 'Please enter a valid email address.');
            }

            // Validate Message
            if (!message || message.length < 10) {
                isValid = false;
                showFieldError(contactMessageInput, messageError, 'Please enter a message with at least 10 characters.');
            }

            if (!isValid) return;

            // Update button to sending/loading state
            setSubmitLoading(true);

            /*
             * =========================================================================
             * RESEND API / EMAIL SERVICE INTEGRATION POINT
             * =========================================================================
             * To send real emails directly to snehabasavaraj937@gmail.com using Resend (https://resend.com):
             *
             * 1. CREATE A BACKEND ENDPOINT (e.g., /api/send-email in Next.js/Express/Cloudflare Worker):
             *    (Never put your Resend API key directly in client-side browser JavaScript)
             *
             *    // Backend endpoint code example:
             *    import { Resend } from 'resend';
             *    const resend = new Resend(process.env.RESEND_API_KEY);
             *
             *    export async function POST(req) {
             *        const { name, email, message } = await req.json();
             *        const result = await resend.emails.send({
             *            from: 'Portfolio Contact <onboarding@resend.dev>', // or your verified domain
             *            to: 'snehabasavaraj937@gmail.com',                 // Sneha's email address
             *            reply_to: email,
             *            subject: `New Portfolio Message from ${name}`,
             *            html: `
             *                <h3>New Contact Inquiry</h3>
             *                <p><strong>Name:</strong> ${name}</p>
             *                <p><strong>Email:</strong> ${email}</p>
             *                <p><strong>Phone:</strong> 8618728687</p>
             *                <p><strong>Message:</strong></p>
             *                <p style="white-space: pre-wrap;">${message}</p>
             *            `
             *        });
             *        return new Response(JSON.stringify(result), { status: 200 });
             *    }
             *
             * 2. CLIENT-SIDE FETCH CALL:
             *    Uncomment and replace the simulated timeout below with:
             *
             *    try {
             *        const response = await fetch('/api/send-email', {
             *            method: 'POST',
             *            headers: { 'Content-Type': 'application/json' },
             *            body: JSON.stringify({ name, email, message })
             *        });
             *        if (!response.ok) throw new Error('Failed to send email');
             *    } catch (err) {
             *        console.error('Email sending error:', err);
             *        alert('Sorry, there was an issue sending your message. Please email directly: snehabasavaraj937@gmail.com');
             *        setSubmitLoading(false);
             *        return;
             *    }
             * =========================================================================
             */

            // Simulated transmission delay (800ms)
            setTimeout(() => {
                setSubmitLoading(false);

                // Populate confirmation card details
                if (successNameDisplay) successNameDisplay.textContent = name;
                if (successEmailDisplay) successEmailDisplay.textContent = email;

                // Show confirmation card and hide form
                contactForm.style.display = 'none';
                if (contactSuccessCard) {
                    contactSuccessCard.style.display = 'flex';
                }

                // Reset form inputs for next time
                contactForm.reset();
            }, 800);
        });

        // "Send Another Message" button handler
        if (contactResetBtn) {
            contactResetBtn.addEventListener('click', () => {
                if (contactSuccessCard) contactSuccessCard.style.display = 'none';
                contactForm.style.display = 'flex';
                if (contactNameInput) contactNameInput.focus();
            });
        }
    }

    function showFieldError(input, errorElement, message) {
        const wrapper = input.closest('.form-input-wrapper');
        if (wrapper) wrapper.classList.add('has-error');
        if (errorElement) errorElement.textContent = message;
        input.focus();
    }

    function setSubmitLoading(isLoading) {
        if (!contactSubmitBtn) return;
        const btnText = contactSubmitBtn.querySelector('.submit-btn-text');
        const btnIcon = contactSubmitBtn.querySelector('.submit-btn-icon');
        const btnSpinner = contactSubmitBtn.querySelector('.submit-btn-spinner');

        contactSubmitBtn.disabled = isLoading;

        if (isLoading) {
            if (btnText) btnText.textContent = 'Sending Message...';
            if (btnIcon) btnIcon.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';
        } else {
            if (btnText) btnText.textContent = 'Send Message';
            if (btnIcon) btnIcon.style.display = 'inline-block';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    }
});


