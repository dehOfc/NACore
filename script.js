/* ─── Reveal no Scroll ────────────────────────────────────────────────────────*/
function reveal() {
    document.querySelectorAll('.reveal').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100)
            el.classList.add('active');
    });
}
window.addEventListener('scroll', reveal);
reveal();

/* ─── Header Scrolled ────────────────────────────────────────────────────────*/
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

/* ─── FAQ Acordeão ───────────────────────────────────────────────────────────*/
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        document.querySelectorAll('.faq-item').forEach(o => {
            if (o !== item) o.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

/* ─── Validação do Formulário ────────────────────────────────────────────────*/
const validators = {
    nome:       { validate: v => v.trim().length >= 2,
                  msgOk: '✓ Nome válido', msgErr: 'Digite pelo menos 2 caracteres.' },
    email:      { validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
                  msgOk: '✓ E-mail válido', msgErr: 'Insira um e-mail válido (ex: nome@empresa.com).' },
    whatsapp:   { validate: v => v.replace(/\D/g, '').length >= 10,
                  msgOk: '✓ Número válido', msgErr: 'Insira o DDD + número (mín. 10 dígitos).' },
    necessidade:{ validate: v => v.trim().length >= 10,
                  msgOk: '✓ Descrição recebida', msgErr: 'Descreva em pelo menos 10 caracteres.' },
};

function setFieldState(id, isValid) {
    const input = document.getElementById(id);
    const icon  = document.getElementById('icon-' + id);
    const hint  = document.getElementById('hint-' + id);
    const cfg   = validators[id];
    if (!input) return;
    input.classList.remove('is-valid', 'is-invalid');
    if (icon) { icon.className = 'field-icon bx'; icon.classList.remove('show','valid','invalid'); }
    if (hint) { hint.className = 'field-hint'; hint.textContent = ''; }
    if (isValid === null) return;
    if (isValid) {
        input.classList.add('is-valid');
        if (icon) icon.classList.add('bx-check-circle','show','valid');
        if (hint) { hint.classList.add('valid'); hint.textContent = cfg.msgOk; }
    } else {
        input.classList.add('is-invalid');
        if (icon) icon.classList.add('bx-x-circle','show','invalid');
        if (hint) { hint.classList.add('invalid'); hint.textContent = cfg.msgErr; }
    }
}

const waInput = document.getElementById('whatsapp');
if (waInput) {
    waInput.addEventListener('input', () => {
        let d = waInput.value.replace(/\D/g,'').slice(0,11);
        if (d.length > 6)      d = d.replace(/^(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3');
        else if (d.length > 2) d = d.replace(/^(\d{2})(\d{0,5})/,'($1) $2');
        else if (d.length > 0) d = d.replace(/^(\d{0,2})/,'($1');
        waInput.value = d;
    });
}

Object.keys(validators).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let touched = false;
    el.addEventListener('blur',  () => { touched = true; setFieldState(id, validators[id].validate(el.value)); });
    el.addEventListener('input', () => { if (touched) setFieldState(id, validators[id].validate(el.value)); });
});

const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = document.getElementById('btnText');
const btnSpinner  = document.getElementById('btnSpinner');
const formSuccess = document.getElementById('formSuccess');

if (form) {
    form.addEventListener('submit', async e => {
        e.preventDefault();
        let allValid = true;
        Object.keys(validators).forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            const v = validators[id].validate(el.value);
            setFieldState(id, v);
            if (!v) allValid = false;
        });
        if (!allValid) return;
        btnText.style.display    = 'none';
        btnSpinner.style.display = 'block';
        submitBtn.disabled       = true;
        await new Promise(r => setTimeout(r, 1800));
        form.style.display        = 'none';
        formSuccess.style.display = 'flex';
    });
}

/* ─── ROI Calculator ─────────────────────────────────────────────────────────*/
(function initROI() {
    const fields = {
        roiFuncionarios: { el: null, valEl: null, suffix: ' pessoas' },
        roiHoras:        { el: null, valEl: null, suffix: ' h/sem' },
        roiCusto:        { el: null, valEl: null, prefix: 'R$ ', suffix: '/h' },
        roiResposta:     { el: null, valEl: null, suffix: 'h de espera' },
    };

    Object.keys(fields).forEach(id => {
        fields[id].el    = document.getElementById(id);
        fields[id].valEl = document.getElementById(id + 'Val');
    });

    // Check all exist
    if (!fields.roiFuncionarios.el) return;

    function animateNumber(el, target, prefix='', suffix='', duration=700, isCurrency=false) {
        const start     = performance.now();
        const startVal  = parseFloat(el.dataset.current || 0);
        el.dataset.current = target;
        requestAnimationFrame(function step(now) {
            const p     = Math.min((now - start) / duration, 1);
            const ease  = 1 - Math.pow(1 - p, 3);
            const cur   = startVal + (target - startVal) * ease;
            el.textContent = prefix + (isCurrency
                ? cur.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : Math.round(cur)) + suffix;
            if (p < 1) requestAnimationFrame(step);
        });
    }

    function calcROI() {
        const func  = parseInt(fields.roiFuncionarios.el.value);
        const horas = parseInt(fields.roiHoras.el.value);
        const custo = parseInt(fields.roiCusto.el.value);
        const resp  = parseInt(fields.roiResposta.el.value);

        // Update labels
        fields.roiFuncionarios.valEl.textContent = func + ' pessoas';
        fields.roiHoras.valEl.textContent        = horas + ' h/sem';
        fields.roiCusto.valEl.textContent        = 'R$ ' + custo + '/h';
        fields.roiResposta.valEl.textContent     = resp + 'h';

        // Calculations
        const horasMes         = func * horas * 4;           // horas manuais por mês
        const horasEconomizadas = Math.round(horasMes * 0.65); // 65% automatizáveis
        const economiaFinanceira = horasEconomizadas * custo;
        const conversaoBonus    = Math.min(Math.round((resp - 0.5) / resp * 45), 42); // melhoria em conversão
        const roiAnual          = economiaFinanceira * 12;

        animateNumber(document.getElementById('roiHorasResult'),   horasEconomizadas, '',    ' h/mês');
        animateNumber(document.getElementById('roiEconomiaResult'), economiaFinanceira, 'R$ ', '', 700, true);
        animateNumber(document.getElementById('roiConversaoResult'),conversaoBonus,    '+',  '%');
        animateNumber(document.getElementById('roiAnualResult'),    roiAnual,          'R$ ', '', 700, true);
    }

    // Inject slider fill on input
    function updateSliderFill(input) {
        const min = input.min || 0, max = input.max || 100;
        const pct = ((input.value - min) / (max - min)) * 100;
        input.style.background = `linear-gradient(to right, var(--neon-cyan) 0%, var(--neon-cyan) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`;
    }

    Object.values(fields).forEach(f => {
        if (!f.el) return;
        f.el.addEventListener('input', () => { updateSliderFill(f.el); calcROI(); });
        updateSliderFill(f.el);
    });

    calcROI();
})();

/* ─── Chat Widget ────────────────────────────────────────────────────────────*/
(function initChat() {
    const panel    = document.getElementById('chatPanel');
    const toggle   = document.getElementById('chatToggle');
    const closeBtn = document.getElementById('chatCloseBtn');
    const msgsEl   = document.getElementById('chatMessages');
    const inputEl  = document.getElementById('chatInput');
    const sendBtn  = document.getElementById('chatSendBtn');
    const notifDot = document.querySelector('.chat-notif-dot');

    if (!panel) return;

    let isOpen = false;
    let step   = 'start';

    // ── Conversation Script ──
    const flow = {
        start: {
            msg: 'Olá! 👋 Sou o assistente virtual da **N.ACORE**. Estou aqui para te ajudar a encontrar a solução certa para o seu negócio.\n\nO que você está buscando hoje?',
            replies: ['🌐 Site ou Landing Page', '🤖 Chatbot com IA', '📊 Gestão de Ads', '⚙️ Automação (n8n)', '💬 Falar com humano'],
        },
        site: {
            msg: '**Ótima escolha!** Criamos sites e landing pages de alta performance com foco em conversão.\n\n✅ Design premium\n✅ SEO técnico\n✅ Web Vitals otimizados\n✅ Entrega em até 14 dias\n\nQuer ver exemplos ou já agendar uma conversa?',
            replies: ['📅 Agendar reunião', '💰 Ver planos', '← Voltar'],
        },
        chatbot: {
            msg: '**Excelente!** Você está conversando com um exemplo do tipo de chatbot que construímos. 😄\n\nNossos agentes com IA:\n✅ Integram com WhatsApp oficial\n✅ Qualificam leads 24/7\n✅ Conectam ao seu CRM\n✅ Usam GPT-4o ou Gemini\n\nQuer saber como funciona para o seu negócio?',
            replies: ['📅 Agendar reunião', '📖 Ler artigo sobre Chatbots', '← Voltar'],
        },
        ads: {
            msg: '**Perfeito!** Gerenciamos campanhas de performance no Meta e Google para maximizar seu ROI.\n\n✅ Criação de criativos com IA\n✅ Gestão diária de campanhas\n✅ Relatórios automáticos toda semana\n✅ Otimização contínua de ROAS\n\nQual plataforma você usa hoje?',
            replies: ['📘 Meta Ads (Facebook/Instagram)', '🔍 Google Ads', '🔀 Ambas', '← Voltar'],
        },
        n8n: {
            msg: '**Show!** O n8n é a espinha dorsal das nossas automações. Com ele podemos:\n\n✅ Conectar qualquer sistema via API\n✅ Automatizar relatórios de marketing\n✅ Criar esteiras de follow-up\n✅ Emitir NF-e automaticamente\n\nQual processo você quer eliminar primeiro?',
            replies: ['📬 Follow-up de leads', '📊 Relatórios automáticos', '🔗 Integração CRM/ERP', '📅 Agendar reunião', '← Voltar'],
        },
        agenda: {
            msg: '**Perfeito!** André e Nycolas estão disponíveis para uma análise gratuita do seu projeto.\n\nClique no botão abaixo para ir diretamente ao WhatsApp e agendar em menos de 1 minuto. 🚀',
            replies: ['💬 Abrir WhatsApp agora', '← Voltar ao início'],
        },
        meta: {
            msg: 'Ótimo! O Meta Ads é extremamente poderoso quando bem estruturado. Trabalhamos com:\n\n✅ API de Conversões (sem perda de dados)\n✅ Criativos gerados com IA\n✅ Testes A/B sistemáticos\n\nVamos conversar sobre o seu orçamento e objetivos?',
            replies: ['📅 Agendar reunião', '← Voltar'],
        },
        google: {
            msg: 'O Google Ads entrega intenção de compra direta — o lead já está buscando o que você vende!\n\n✅ Search, Display e Performance Max\n✅ Palavras-chave com intenção de compra\n✅ Remarketing inteligente\n\nQuer uma análise da sua conta atual?',
            replies: ['📅 Agendar reunião', '← Voltar'],
        },
        human: {
            msg: 'Claro! 😊 André e Nycolas são os especialistas da N.ACORE e vão adorar conversar com você.\n\nClique abaixo para ir direto ao WhatsApp — costumamos responder em minutos!',
            replies: ['💬 Chamar no WhatsApp', '← Voltar ao início'],
        },
        planos: {
            msg: 'Nossos planos são **as-a-service** — você tem um setor de tecnologia completo à disposição.\n\n📦 **Starter** — Site + manutenção\n📦 **Growth** — Starter + Ads + relatórios\n📦 **PRO** — Growth + chatbot IA + n8n\n\nTodos sob consulta para garantir o melhor custo-benefício.',
            replies: ['📅 Agendar reunião', '← Voltar ao início'],
        },
        artigo_chat: {
            msg: 'Tenho um artigo completo sobre chatbots no WhatsApp no nosso blog! Ele explica a arquitetura, os fluxos de qualificação e os resultados que os clientes alcançam.',
            replies: ['📖 Abrir artigo', '📅 Agendar reunião', '← Voltar'],
        },
    };

    // ── Helpers ──
    function addMsg(text, isBot) {
        const div = document.createElement('div');
        div.className = `chat-msg ${isBot ? 'bot' : 'user'}`;
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble';
        bubble.innerHTML = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
        div.appendChild(bubble);
        msgsEl.appendChild(div);
        msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    function addTyping() {
        const t = document.createElement('div');
        t.className = 'chat-msg bot';
        t.id = 'typingIndicator';
        t.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
        msgsEl.appendChild(t);
        msgsEl.scrollTop = msgsEl.scrollHeight;
        return t;
    }

    function removeTyping() {
        const t = document.getElementById('typingIndicator');
        if (t) t.remove();
    }

    function clearReplies() {
        document.querySelectorAll('.chat-quick-replies').forEach(el => el.remove());
    }

    function addReplies(replies) {
        clearReplies();
        const wrap = document.createElement('div');
        wrap.className = 'chat-msg bot';
        const rDiv = document.createElement('div');
        rDiv.className = 'chat-quick-replies';
        replies.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'chat-qr-btn';
            btn.textContent = r;
            btn.addEventListener('click', () => handleReply(r));
            rDiv.appendChild(btn);
        });
        wrap.appendChild(rDiv);
        msgsEl.appendChild(wrap);
        msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    function botSay(nodeKey, delay = 800) {
        const node = flow[nodeKey];
        if (!node) return;
        const typing = addTyping();
        clearReplies();
        setTimeout(() => {
            removeTyping();
            addMsg(node.msg, true);
            if (node.replies) addReplies(node.replies);
        }, delay);
    }

    function handleReply(text) {
        clearReplies();
        addMsg(text, false);

        const map = {
            '🌐 Site ou Landing Page':          () => botSay('site'),
            '🤖 Chatbot com IA':                () => botSay('chatbot'),
            '📊 Gestão de Ads':                 () => botSay('ads'),
            '⚙️ Automação (n8n)':               () => botSay('n8n'),
            '💬 Falar com humano':              () => botSay('human'),
            '📅 Agendar reunião':               () => botSay('agenda'),
            '💰 Ver planos':                    () => botSay('planos'),
            '📘 Meta Ads (Facebook/Instagram)': () => botSay('meta'),
            '🔍 Google Ads':                    () => botSay('google'),
            '🔀 Ambas':                         () => botSay('agenda'),
            '📬 Follow-up de leads':            () => botSay('agenda'),
            '📊 Relatórios automáticos':        () => botSay('agenda'),
            '🔗 Integração CRM/ERP':            () => botSay('agenda'),
            '📖 Ler artigo sobre Chatbots':     () => botSay('artigo_chat'),
            '📖 Abrir artigo':                  () => { setTimeout(() => window.open('blog/chatbots-whatsapp.html','_blank'), 400); },
            '← Voltar':                         () => botSay('start'),
            '← Voltar ao início':               () => botSay('start'),
            '💬 Abrir WhatsApp agora':          () => { setTimeout(() => window.open('https://wa.me/550000000000?text=Ol%C3%A1!%20Vim%20pelo%20chat%20do%20site%20da%20N.ACORE%20e%20gostaria%20de%20agendar%20uma%20reuni%C3%A3o.','_blank'), 400); botSay('start'); },
            '💬 Chamar no WhatsApp':            () => { setTimeout(() => window.open('https://wa.me/550000000000?text=Ol%C3%A1!%20Vim%20pelo%20chat%20do%20site%20da%20N.ACORE.','_blank'), 400); botSay('start'); },
        };

        const action = map[text];
        if (action) action();
        else {
            // Free text — generic response
            const typing = addTyping();
            setTimeout(() => {
                removeTyping();
                addMsg('Entendido! 😊 Para dúvidas mais específicas, nossa equipe vai poder te ajudar melhor. Quer agendar uma conversa rápida?', true);
                addReplies(['📅 Agendar reunião', '💬 Chamar no WhatsApp', '← Voltar ao início']);
            }, 900);
        }
    }

    // ── Toggle ──
    function openChat() {
        isOpen = true;
        panel.classList.add('open');
        if (notifDot) notifDot.style.display = 'none';
        toggle.innerHTML = '<i class="bx bx-x"></i>';
        if (!msgsEl.children.length) {
            setTimeout(() => botSay('start', 600), 200);
        }
    }

    function closeChat() {
        isOpen = false;
        panel.classList.remove('open');
        toggle.innerHTML = '<i class="bx bx-chat"></i><span class="chat-notif-dot"></span>';
        // hide dot after first open
        const dot = toggle.querySelector('.chat-notif-dot');
        if (dot) dot.style.display = 'none';
    }

    toggle.addEventListener('click', () => isOpen ? closeChat() : openChat());
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    // Send free-text
    function sendUserMsg() {
        const txt = inputEl.value.trim();
        if (!txt) return;
        inputEl.value = '';
        handleReply(txt);
    }

    sendBtn.addEventListener('click', sendUserMsg);
    inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendUserMsg(); });

    // Auto-open after 8s (only once)
    setTimeout(() => {
        if (!isOpen && !sessionStorage.getItem('chatOpened')) {
            sessionStorage.setItem('chatOpened', '1');
            openChat();
        }
    }, 8000);
})();
