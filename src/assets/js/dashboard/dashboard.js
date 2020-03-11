function addFullViewNode(iconPath, nodeClass, text, id) {
    const parent = $('#dashboard__full-view');
    parent.append(`
    <div id="${id}" class="draggable dashboard__draggable ${nodeClass}-wrapper" style="left:${mouse.x - parent.offset().left - 50}px;top:${mouse.y - parent.offset().top - 50}px">
        <div class="dashboard__counter">0</div>
        <div class="dashboard__pin"><i class="fas fa-thumbtack"></i></div>
        <div class="dashboard__remove"><i class="fas fa-times"></i></div>
        <div class="${nodeClass}">
            <img src="${iconPath}">
        </div>
        <span class="dashboard__text">${text}</span>
    </div>
    `);
    $(`#${id} .dashboard__pin`).click(function() {
        $(this).toggleClass('active');
    });
    $(`#${id} .dashboard__remove`).click(function() {
        notify.me({
            subheader: `Delete \"${$(this).parent().find('.dashboard__text').text()}"`,
            body: 'Are you sure you want to delete this?',
            fadeInDuration: 200,
            fadeOutDuration: 300,
            closeButton: false,
            buttons: [{
                text: 'Yes',
                class: 'medium',
                action: () => {
                    $(this).parent().fadeOut(200, 'swing', () => $(this).parent().remove());
                },
                close: true
            }, {
                text: 'No',
                class: 'medium',
                action: () => {},
                close: true
            }]
        });
    });
}

function increaseCounter(node) {
    const counter = node.find('.dashboard__counter');
    if (counter.length) {
        let currentCount = parseInt(counter.text());
        counter.text(++currentCount);
        counter.addClass('show');
    }
}

$(function() {
    const fullscreenBtn = $('#dashboard__fullscreen');
    const anim = lottie.loadAnimation({
        container: fullscreenBtn.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/fullscreen.json',
        initialSegment: [0, 14]
    });
    fullscreenBtn.hover(function() {
        anim.setDirection(1);
        anim.setSpeed(3);
        anim.play();
    }, function() {
        anim.setDirection(-1);
        anim.setSpeed(3);
        anim.play();
    });
    fullscreenBtn.on('click', function() {
        setFullscreenElement($('#dashboard__full-view'));
    });
    contextly.init('#dashboard__full-view', '#dashboard__full-view', [{
        icon: 'document',
        text: 'Create a card',
        tooltip: '',
        action: () => {
            const id = 'dashboard__card-' + Math.floor(Math.random() * 99999);
            addFullViewNode('/files/svg/document.svg', 'dashboard__card', 'New Card', id);
        }
    }, {
        icon: 'add-folder',
        text: 'Create a folder',
        tooltip: '',
        action: () => {
            const id = 'dashboard__folder-' + Math.floor(Math.random() * 99999);
            addFullViewNode('/files/svg/folder.svg', 'dashboard__folder', 'New Folder', id);
        }
    }], {
        minHeight: 100
    });
    $(window).afterResize(function(e) {
        if (e.size.width >= 800)
            $('.dashboard__draggable').each(function() {
                let parent = $('#dashboard__full-view');
                let _ = $(this);
                let top = parseFloat(_.css('top').replace('px', ''));
                let left = parseFloat(_.css('left').replace('px', ''));
                let y = _.attr('data-y') || 0;
                y = parseFloat(y);
                let x = _.attr('data-x') || 0;
                x = parseFloat(x);
                let relativeY = top + y;
                let relativeX = left + x;
                let width = _.width();
                let height = _.height();
                _.css('transition', 'transform 200ms cubic-bezier(.4,.0,.23,1)');
                if (relativeY + height > parent.innerHeight() && relativeX + width > parent.innerWidth()) {
                    let newX = parent.innerWidth() - width - left;
                    let newY = parent.innerHeight() - height - top;
                    _.attr('data-x', newX);
                    _.attr('data-y', newY);
                    _.css('transform', `translate(${newX}px, ${newY}px)`);
                } else if (relativeY + height > parent.height()) {
                    let newY = parent.innerHeight() - height - top;
                    _.attr('data-y', newY);
                    _.css('transform', `translate(${x}px, ${newY}px)`);
                } else if (relativeX + width > parent.width()) {
                    let newX = parent.innerWidth() - width - left;
                    _.attr('data-x', newX);
                    console.log(`translate(${newX}px, ${y}px)`)
                    _.css('transform', `translate(${newX}px, ${y}px)`);
                }
                setTimeout(() => _.css('transition', 'unset'), 210);
            });
    });
    notify.me({
        header: 'Welcome!',
        body: 'Before we get started, we need to take care of some housekeeping items.',
        fadeInDuration: 200,
        fadeOutDuration: 300,
        closeButton: false,
        buttons: [{
            text: 'Alright',
            class: 'medium',
            action: () => {},
            close: true
        }],
        onStartClose: () => {
            notify.me({
                body: 'Is the size of the <strong>Full View</strong> your preferred size?',
                fadeInDuration: 200,
                fadeOutDuration: 300,
                closeButton: false,
                queue: true,
                buttons: [{
                    text: 'Yes, it\'s perfect!',
                    class: 'small',
                    action: button => {
                        notify.me({
                            header: 'Awesome!',
                            body: 'It looks like you\'re all set then!<br>Happy planning!',
                            fadeInDuration: 200,
                            fadeOutDuration: 300,
                            buttons: [{
                                text: 'Get Started',
                                class: 'medium',
                                close: true,
                                action: () => {}
                            }]
                        });
                    },
                    close: true
                }, {
                    text: 'No, I need to resize it.',
                    class: 'small',
                    closeButton: false,
                    action: button => {
                        notify.me({
                            header: 'Not a problem.',
                            body: 'We\'ll give you a moment to resize it and check back with you afterwards.',
                            fadeInDuration: 200,
                            fadeOutDuration: 300,
                            buttons: [{
                                text: 'Ok',
                                class: 'medium',
                                close: true,
                                action: () => {}
                            }]
                        });
                    },
                    close: true
                }]
            });
        }
    });
});

interact('.dashboard__folder-wrapper').dropzone({
    accept: '.dashboard__card-wrapper',
    overlap: 0.25,
  
    ondropactivate: function (event) {
    },
    ondragenter: function (event) {
        // On card dragged in (to the folder).
        const card = event.relatedTarget;
        const folder = event.target;

        // feedback the possibility of a drop
        folder.classList.add('selected-dropzone');
        card.classList.add('can-drop');
    },
    ondragleave: function (event) {
        // On card dragged away (from the folder).
        const card = event.relatedTarget;
        const folder = event.target;

        folder.classList.remove('selected-dropzone');
        card.classList.remove('can-drop');
    },
    ondrop: function (event) {
        // On card dropped (into folder).
        const card = event.relatedTarget;
        const folder = event.target;

        folder.classList.remove('selected-dropzone');
        increaseCounter($(folder));
        $(card).fadeOut(200, function() {
            card.classList.remove('can-drop');
            $(this).remove();
        });
    },
    ondropdeactivate: function (event) {
    }
});

interact('.draggable').draggable({
    inertia: true,
    modifiers: [
        interact.modifiers.restrictRect({
            restriction: 'parent',
            endOnly: true
        })
    ],
    autoScroll: true,
    listeners: {
        move: dragMoveListener,
        end (event) {
        }
    }
});

function dragMoveListener (event) {
    var target = event.target;
    if ($(target).find('.dashboard__pin').hasClass('active'))
        return;

    // keep the dragged position in the data-x/data-y attributes
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform =
        'translate(' + x + 'px, ' + y + 'px) ';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;