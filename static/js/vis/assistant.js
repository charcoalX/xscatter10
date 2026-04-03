(function () {
    var messages = []; // conversation history sent to API

    var WELCOME = 'Welcome to this visual analysis tool! I\'m your AI Assistant. Ask me anything about how to use it — selecting images, reading the scatter plot, understanding LRP heatmaps, or anything else. Note: currently only Synthetic X-ray data and T-SNE embedding are available; CIFAR-10, Experimental X-ray, and PCA are not available.';

    function init() {
        var btn   = $('#ai-assistant-btn');
        var panel = $('#ai-assistant-panel');

        // Show welcome message on first open
        btn.on('click', function () {
            var isOpen = panel.hasClass('open');
            panel.toggleClass('open');
            if (!isOpen && $('#ai-assistant-messages').children().length === 0) {
                appendMessage('assistant', WELCOME);
            }
        });

        $('#ai-assistant-close').on('click', function () {
            panel.removeClass('open');
        });

        $('#ai-assistant-send').on('click', sendMessage);

        $('#ai-assistant-input').on('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    function sendMessage() {
        var input = $('#ai-assistant-input');
        var text  = input.val().trim();
        if (!text) return;

        input.val('');
        appendMessage('user', text);
        messages.push({ role: 'user', content: text });

        var thinking = appendMessage('assistant', '…');
        $('#ai-assistant-send').prop('disabled', true);

        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/AskAssistant',
            data: JSON.stringify({ messages: messages }),
            timeout: 30000,
            success: function (result) {
                thinking.remove();
                $('#ai-assistant-send').prop('disabled', false);
                if (result.status === 'ok') {
                    appendMessage('assistant', result.reply);
                    messages.push({ role: 'assistant', content: result.reply });
                } else {
                    appendMessage('assistant', 'Error: ' + result.message, true);
                    messages.pop(); // remove unanswered user message from history
                }
            },
            error: function (xhr) {
                thinking.remove();
                $('#ai-assistant-send').prop('disabled', false);
                var msg = 'Could not reach the assistant.';
                try {
                    var body = JSON.parse(xhr.responseText);
                    if (body && body.message) msg = 'Error: ' + body.message;
                } catch (e) {}
                appendMessage('assistant', msg, true);
                messages.pop();
            }
        });
    }

    function appendMessage(role, text, isError) {
        var msgEl = $('<div/>', { class: 'ai-msg ai-msg-' + role });
        if (isError) msgEl.addClass('ai-msg-error');
        // Simple markdown: newlines → <br>
        msgEl.html(text.replace(/\n/g, '<br>'));
        $('#ai-assistant-messages').append(msgEl);
        var container = document.getElementById('ai-assistant-messages');
        container.scrollTop = container.scrollHeight;
        return msgEl;
    }

    $(document).ready(init);
})();
