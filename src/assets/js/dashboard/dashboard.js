function limitText(text) {
    return text.replace(/^(.{30}[^\s]*).*/, '$1...');
}

function addFullViewNode(iconPath, nodeClass, text, id, x = mouse.x, y = mouse.y) {
    const parent = $('#dashboard__full-view');
    const fullViewButtons = $('#dashboard__full-view #dashboard__buttons');
    $(`
    <div id="${id}" class="draggable dashboard__draggable ${nodeClass}-wrapper" style="left:${x - parent.offset().left - 50}px;top:${y - parent.offset().top - 50}px">
        <div class="${nodeClass}">
            <div class="dashboard__counter">0</div>
            <div class="dashboard__pin"><i class="fas fa-thumbtack"></i></div>
            <div class="dashboard__remove"><i class="fas fa-times"></i></div>
            <img src="${iconPath}">
        </div>
        <span class="dashboard__text"></span>
    </div>
    `).insertBefore(fullViewButtons);
    $(`#${id} .dashboard__text`).text(limitText(text));
    $(`#${id} .dashboard__pin`).click(function(e) {
        e.preventDefault();
        $(this).toggleClass('active');
        return false;
    });
    $(`#${id} .dashboard__remove`).click(function(e) {
        e.preventDefault();
        notify.me({
            subheader: `Delete \"${$(this).parent().parent().find('.dashboard__text').text()}"`,
            body: 'Are you sure you want to delete this?',
            fadeInDuration: 200,    
            fadeOutDuration: 300,
            closeButton: false,
            buttons: [{
                text: 'Yes',
                class: 'medium',
                action: () => {
                    let nodeWrapper = $(this).parent().parent();
                    nodeWrapper.fadeOut(200, 'swing', () => nodeWrapper.remove());
                    let f = folder.find(nodeWrapper.attr('id'));
                    let c = card.find(nodeWrapper.attr('id'));
                    if (f) { // If the node we're removing is a folder...
                        folder.delete(f.id);
                    } else if (c) { // If the node we're removing is a card...
                        card.delete(c.id);
                    }
                },
                close: true
            }, {
                text: 'No',
                class: 'medium',
                action: () => {},
                close: true
            }]
        });
        return false;
    });
}

function registerFolderClickEvent(folderId) {
    $('#' + folderId).click(function() {
        let dragging = $(this).attr('dragging');
        if (dragging && dragging === 'true')
        {
            $(this).attr('dragging', 'false');
            return;   
        }
        // Start building the "modify folder" pop-up.
        const f = folder.find(this.id);
        if (f.cards.length > 0) {
            notify.me({
                header: `Modify "${f.name}"`,
                subheader: 'Enter a new name and description',
                class: 'notify-popup dashboard__modify-popup',
                body: `
                <div class="dashboard__modify-popup__path-wrapper">
                    <div class="dashboard__modify-popup__path">
                        <div class="folder">${f.name}</div>
                    </div>
                </div>
                <div class="dashboard__modify-folder-container">
                    <div class="dashboard__modify-folder-name">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="${f.name}">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__modify-folder-description-with-cards">
                        <div class="textarea">
                            <textarea id="description">${f.description}</textarea>
                            <label for="description">
                                <span>Description</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="cards-container">
                    <h5>Cards<span style="color:#ccc;font-style:italic"> - click <i style="padding: 0 0.2em" class="fas fa-arrow-alt-circle-right"></i> to remove from the folder</span></h5>
                </div>
                `,
                buttons: [ {
                    text: 'Save', 
                    close: true,
                    action: () => {
                        f.name = $('.dashboard__modify-folder-name input').attr('value');
                        f.description = $('.dashboard__modify-folder-description-with-cards textarea').attr('value');
                        $('#' + f.id + ' .dashboard__text').text(f.name);
                    }
                }],
                closeButton: true
            }, n => {
                initializeTextboxes();
                let notifBody = n.$.find('.cards-container');
                let cardsList = notifBody.find('.dashboard__modify-folder__cards ul');
                if (!cardsList.length) {
                    notifBody.append('<div class="dashboard__modify-folder__cards"><ul></ul></div>');
                    cardsList = notifBody.find('.dashboard__modify-folder__cards ul');
                }
                for (let c of f.cards) {
                    let cardId = 'dashboard__modify-folder__card-' + Math.floor(Math.random() * 99999);
                    cardsList.append(`<div class="dashboard__modify-folder__card" id="${cardId}"><li>${c.name}</li><i class="fas fa-arrow-alt-circle-right"></i></div>`);
                    registerCardClickEvent(c, `#${cardId} li`, `#${cardId} li`);
                    $(`#${cardId} .fa-arrow-alt-circle-right`).click(function() {
                        let cardItem = $(this).parent();
                        cardItem.css({
                            transform: 'translateX(100%)',
                            opacity: 0
                        });
                        f.removeCard(c.id);
                        let axis = Math.ceil(Math.random() * 100);
                        let flipped = Math.ceil(Math.random() * 100);
                        let x = $('#' + folderId).offset().left + (axis >= 50 ? Math.floor(Math.random() * 241): 0) - 70 + (axis < 50 && flipped >= 50 ? 240 : 0);
                        let y = $('#' + folderId).offset().top + (axis < 50 ? Math.floor(Math.random() * 241): 0) - 70 + (axis >= 50 && flipped < 50 ? 240 : 0);
                        addFullViewNode('/files/svg/document.svg', 'dashboard__card', c.name, c.id, x, y);
                        registerCardClickEvent(c, '#' + c.id);
                        let cardParent = cardItem.parent();
                        cardItem.nextAll().css({
                            transform: 'translateY(-100%)'
                        });
                        setTimeout(() => {
                            let oldTransition = cardParent.children('.dashboard__modify-folder__card').css('transition');
                            cardParent.children('.dashboard__modify-folder__card').css({
                                transition: 'unset'
                            });
                            cardItem.remove();
                            cardParent.children('.dashboard__modify-folder__card').css({
                                transform: 'unset'
                            });
                            setTimeout(() => {
                                cardParent.children('.dashboard__modify-folder__card').css({
                                    transition: oldTransition
                                });
                            }, 50);
                        }, 210);
                    });
                }
            });
        } else {
            notify.me({
                header: `Modify "${f.name}"`,
                subheader: 'Enter a new name and description',
                class: 'notify-popup dashboard__modify-popup',
                body: `
                <div class="dashboard__modify-popup__path-wrapper">
                    <div class="dashboard__modify-popup__path">
                        <div class="folder">${f.name}</div>
                    </div>
                </div>
                <div class="dashboard__modify-folder-container">
                    <div class="dashboard__modify-folder-name">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="${f.name}">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__modify-folder-description">
                        <div class="textarea">
                            <textarea id="description">${f.description}</textarea>
                            <label for="description">
                                <span>Description</span>
                            </label>
                        </div>
                    </div>
                </div>`,
                buttons: [ {
                    text: 'Save', 
                    close: true,
                    action: () => {
                        f.name = $('.dashboard__modify-folder-name input').attr('value');
                        f.description = $('.dashboard__modify-folder-description textarea').attr('value');
                        $('#' + f.id + ' .dashboard__text').text(f.name);
                    }
                }],
                closeButton: true
            }, () => {
                initializeTextboxes();
            });
        }
    });
}

function registerCardClickEvent(c, selector, customTextSelector) {
    $(selector).click(function() {
        let dragging = $(this).attr('dragging');
        if (dragging && dragging === 'true')
        {
            $(this).attr('dragging', 'false');
            return;   
        }
        // Start building the "modify card" pop-up.
        notify.me({
            header: `Modify "${c.name}"`,
            subheader: 'Enter a new name and description',
            class: 'notify-popup dashboard__modify-popup',
            body: `
            <div class="dashboard__modify-popup__path-wrapper">
                <div class="dashboard__modify-popup__path">
                    ${c.currentFolderId ? '<div class="folder">' + folder.find(c.currentFolderId).name + '</div>' : ''}<div class="card">${c.name}</div>
                </div>
            </div>
            <div class="dashboard__modify-card-container">
                <div class="dashboard__modify-card-name">
                    <div class="textbox">
                        <input type="text" name="name" autocomplete="off" required value="${c.name}">
                        <label for="name">
                            <span>Name</span>
                        </label>
                    </div>
                </div>
                <div class="dashboard__modify-card-description">
                    <div class="textarea">
                        <textarea id="description">${c.description}</textarea>
                        <label for="description">
                            <span>Description</span>
                        </label>
                    </div>
                </div>
            </div>
            `,
            buttons: [ {
                text: 'Change Due Date',
                close: false,
                action: () => {
                    notify.me({
                        header: 'Modify the Due Date',
                        subheader: 'Enter a new due date and time',
                        class: 'notify-popup dashboard__due-date-popup',
                        body: `
                        <div class="dashboard__modify-popup__path-wrapper">
                            <div class="dashboard__modify-popup__path">
                            ${c.currentFolderId ? '<div class="folder">' + folder.find(c.currentFolderId).name + '</div>' : ''}<div class="card">${c.name}</div>
                            </div>
                        </div>
                        <div class="dashboard__due-date-container">
                            <div class="dashboard__due-date-time">
                                <div class="textbox">
                                        <input type="time" name="time" autocomplete="off" required value="${c.time ? c.time : ""}">
                                        <label for="time">
                                            <span>Time</span>
                                        </label>
                                    </div>
                                </div>
                            <div class="dashboard__due-date-date">
                                <div class="textbox">
                                    <input type="date" name="date" autocomplete="off" required value="${c.date ? c.date : ""}">
                                    <label for="date">
                                        <span>Date</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        `,
                        buttons: [ {
                            text: 'Done', 
                            close: true,
                            action: () => {
                                c.date = $('.dashboard__due-date-date input').attr('value'); // Get the value of $('.dashboard__create-due-date-date input')
                                c.time = $('.dashboard__due-date-time input').attr('value'); // Get the value of $('.dashboard__create-due-date-time input')
                            }
                        }],
                        closeButton: false
                    }, () => {
                        initializeTextboxes();
                    });
                }
            }, {
                text: 'Save',
                close: true,
                action: () => {
                    c.name = $('.dashboard__modify-card-name input').attr('value');
                    c.description = $('.dashboard__modify-card-description textarea').attr('value');
                    if (!customTextSelector)
                        $('#' + c.id + ' .dashboard__text').text(c.name);
                    else
                        $(customTextSelector).text(c.name);
                }
            }],
            closeButton: true
        }, () => {
            initializeTextboxes();
        });
    });
}

const card = Object.freeze(new function() {
    let obj = {}, cards = [];

    obj.create = cardId => {
        let c = {
            id: cardId,
            name: 'New Card'
        };
        cards.push(c);
        return c;
    };

    obj.delete = cardId => {
        let c = cards.findIndex(_ => _.id === cardId);
        if (c >= 0)
            cards.splice(c, 1);
    };

    obj.find = id => cards.find(_ => _.id === id);

    return obj;
});

const folder = Object.freeze(new function() {
    let obj = {}, folders = [];

    obj.create = folderId => {
        let f = {
            id: folderId,
            name: 'New Folder',
            cards: [],
            addCard: cardId => {
                const $folder = $('#' + f.id);
                const counter = $folder.find('.dashboard__counter');
                if (counter.length) {
                    let currentCount = parseInt(counter.text());
                    counter.text(++currentCount);
                    counter.addClass('show');
                }
                let c = card.find(cardId);
                c.currentFolderId = f.id;
                f.cards.push(c);
                let contextOptions = contextly.find($folder).options;
                if (contextOptions.length < 3) {
                    contextOptions.push({
                        id: c.id,
                        text:
                        `
                            <div class="banner" cardId="${c.id}">
                                ${c.name}
                            </div>
                        `,
                        tooltip: '',
                        action: () => { },
                        onShow: $e => {
                            $(`#${$e.attr('id')} .banner`).text(c.name);
                            registerCardClickEvent(c, `#${$e.attr('id')}`);
                        }
                    });
                } else if (contextOptions.length === 3) {
                    contextOptions.push({
                        text: 'View More',
                        tooltip: '',
                        action: () => {
                            $('#' + f.id).click();
                        }
                    });
                }
                contextly.modify('#' + f.id, contextOptions, {
                    heightFactor: 8,
                    maxWidth: 300
                });
            },
            removeCard: cardId => {
                const $folder = $('#' + f.id);
                const counter = $folder.find('.dashboard__counter');
                if (counter.length) {
                    let currentCount = parseInt(counter.text()) - 1;
                    counter.text(currentCount);
                    if (currentCount === 0)
                        counter.removeClass('show');
                }
                let c = card.find(cardId);
                f.cards.splice(f.cards.findIndex(_ => _.id === cardId), 1);
                c.currentFolderId = null;
                let contextOptions = contextly.find($folder).options;
                contextOptions.splice(0, contextOptions.length);
                for (let card of f.cards) {
                    if (contextOptions.length < 3) {
                        contextOptions.push({
                            id: card.id,
                            text:
                            `
                                <div class="banner" cardId="${card.id}">
                                    ${card.name}
                                </div>
                            `,
                            tooltip: '',
                            action: () => { },
                            onShow: $e => {
                                $(`#${$e.attr('id')} .banner`).text(card.name);
                                registerCardClickEvent(card, `#${$e.attr('id')}`);
                            }
                        });
                    } else break;
                }
                if (f.cards.length > 3) {
                    contextOptions.push({
                        text: 'View More',
                        tooltip: '',
                        action: () => {
                            $('#' + f.id).click();
                        }
                    });
                }
                contextly.modify('#' + f.id, contextOptions, {
                    heightFactor: 8,
                    maxWidth: 300
                });
            },
            findCard: id => f.cards.find(_ => _.id === id)
        };
        folders.push(f);
        return f;
    };

    obj.delete = folderId => {
        let fIndex = folders.findIndex(_ => _.id === folderId);
        if (fIndex >= 0) {
            let f = folders[fIndex];
            for (let innerCard of f.cards) {
                card.delete(innerCard.id);
            }
            f.cards.splice(0, f.cards.length);
            folders.splice(fIndex, 1);
        }
    };

    obj.find = id => folders.find(_ => _.id === id);

    return obj;
});

function returnNodesToView(viewWidth) {
    if (viewWidth >= 800)
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
            } else if (relativeY + height > parent.innerHeight()) {
                let newY = parent.innerHeight() - height - top;
                _.attr('data-y', newY);
                _.css('transform', `translate(${x}px, ${newY}px)`);
            } else if (relativeX + width > parent.innerWidth()) {
                let newX = parent.innerWidth() - width - left;
                _.attr('data-x', newX);
                console.log(`translate(${newX}px, ${y}px)`)
                _.css('transform', `translate(${newX}px, ${y}px)`);
            } else if (relativeY < 0 && relativeX < 0) {
                let newX = -1 * left;
                let newY = -1 * top;
                _.attr('data-x', newX);
                _.attr('data-y', newY);
                _.css('transform', `translate(${newX}px, ${newY}px)`);
            } else if (relativeY < 0) {
                let newY = -1 * top;
                _.attr('data-y', newY);
                _.css('transform', `translate(${x}px, ${newY}px)`);
            } else if (relativeX < 0) {
                let newX = -1 * left;
                _.attr('data-x', newX);
                console.log(`translate(${newX}px, ${y}px)`)
                _.css('transform', `translate(${newX}px, ${y}px)`);
            }
            setTimeout(() => _.css('transition', 'unset'), 210);
        });
}

$(function() {
    if (user.backgroundTile) {
        const backgroundImage = $('#dashboard__full-view .background img');
        backgroundImage.attr('src', '');
        backgroundImage.css('background', `url("${user.backgroundTile}") repeat`);
    }
    const fullscreenBtn = $('#dashboard__fullscreen');
    const fullscreenAnim = lottie.loadAnimation({
        container: fullscreenBtn.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/fullscreen.json',
        initialSegment: [0, 14]
    });
    fullscreenBtn.hover(function() {
        fullscreenAnim.setDirection(1);
        fullscreenAnim.setSpeed(3);
        fullscreenAnim.play();
    }, function() {
        fullscreenAnim.setDirection(-1);
        fullscreenAnim.setSpeed(3);
        fullscreenAnim.play();
    });
    fullscreenBtn.click(function() {
        setFullscreenElement($('#dashboard__full-view'));
    });
    const returnNodesBtn = $('#dashboard__return-nodes');
    const returnNodesAnim = lottie.loadAnimation({
        container: returnNodesBtn.get(0),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: '/lottie/design.json',
        initialSegment: [0, 14]
    });
    returnNodesBtn.hover(function() {
        returnNodesAnim.setDirection(1);
        returnNodesAnim.setSpeed(1.2);
        returnNodesAnim.play();
    }, function() {
        returnNodesAnim.setDirection(-1);
        returnNodesAnim.setSpeed(1.2);
        returnNodesAnim.play();
    });
    returnNodesBtn.click(function() {
        returnNodesToView($(window).width());
    });
    contextly.init('#dashboard__full-view', '#dashboard__full-view', [{
        icon: 'document',
        text: 'Create a card',
        tooltip: '',
        action: e => {
            const id = 'dashboard__card-' + Math.floor(Math.random() * 99999);
            let c = card.create(id);
            notify.me({
                header: `Create a Card`,
                subheader: 'Enter a name and description',
                class: 'notify-popup dashboard__create-card-popup',
                body: `
                <div class="dashboard__create-card-container">
                    <div class="dashboard__create-card-name">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="New Card">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__create-card-description">
                        <div class="textarea">
                            <textarea id="description"></textarea>
                            <label for="description">
                                <span>Description</span>
                            </label>
                        </div>
                    </div>
                </div>
                `,
                buttons: [ {
                    text: 'Set Due Date',
                    close: false,
                    action: () => {
                        notify.me({
                            header: 'Set a Due Date',
                            subheader: 'Enter a due date and time',
                            class: 'notify-popup dashboard__due-date-popup',
                            body: `
                            <div class="dashboard__due-date-container">
                                <div class="dashboard__due-date-time">
                                    <div class="textbox">
                                            <input type="time" name="time" autocomplete="off" required value="${c.time ? c.time : ""}">
                                            <label for="time">
                                                <span>Time</span>
                                            </label>
                                        </div>
                                    </div>
                                <div class="dashboard__due-date-date">
                                    <div class="textbox">
                                        <input type="date" name="date" autocomplete="off" required value="${c.date ? c.date : ""}">
                                        <label for="date">
                                            <span>Date</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            `,
                            buttons: [ {
                                text: 'Done',
                                close: true,
                                action: () => {
                                    c.date = $('.dashboard__due-date-date input').attr('value'); // Get the value of $('.dashboard__create-due-date-date input')
                                    c.time = $('.dashboard__due-date-time input').attr('value'); // Get the value of $('.dashboard__create-due-date-time input')
                                }
                            }],
                            closeButton: false
                        }, () => {
                            initializeTextboxes();
                        });
                    }
                }, {
                    text: 'Create',
                    close: true,
                    action: () => {
                        c.name = $('.dashboard__create-card-name input').attr('value');
                        c.description = $('.dashboard__create-card-description textarea').attr('value');
                        addFullViewNode('/files/svg/document.svg', 'dashboard__card', c.name, id, e.x, e.y);
                        registerCardClickEvent(c, '#' + id);
                    }
                }],
                closeButton: false
            }, () => {
                initializeTextboxes();
            });
        }
    }, {
        icon: 'add-folder',
        text: 'Create a folder',
        tooltip: '',
        action: e => {
            let folderId = 'dashboard__folder-' + Math.floor(Math.random() * 99999);
            let f = folder.create(folderId);
            notify.me({
                header: 'Create a Folder',
                subheader: 'Enter a name and description.',
                class: 'notify-popup dashboard__create-folder-popup',
                body: `
                <div class="dashboard__create-folder-container">
                    <div class="dashboard__create-folder-name">
                        <div class="textbox">
                            <input type="text" name="name" autocomplete="off" required value="New Folder">
                            <label for="name">
                                <span>Name</span>
                            </label>
                        </div>
                    </div>
                    <div class="dashboard__create-folder-description">
                        <div class="textarea">
                            <textarea id="description"></textarea>
                            <label for="description">
                                <span>Description</span>
                            </label>
                        </div>
                    </div>
                </div>
                `,
                buttons: [{
                    text: 'Create', 
                    close: true,
                    action: () => {
                        f.name = $('.dashboard__create-folder-name input').attr('value');
                        f.description = $('.dashboard__create-folder-description textarea').attr('value');
                        addFullViewNode('/files/svg/folder.svg', 'dashboard__folder', f.name, folderId, e.x, e.y);
                        contextly.init('#' + folderId, '#dashboard__full-view', []);
                        registerFolderClickEvent(folderId);
                    }
                }],
                closeButton: false
            }, () => {
                initializeTextboxes();
            });
        }
    }], {
        minHeight: 100,
        showOnLeftClick: false
    });
    $(window).afterResize(function(e) {
        returnNodesToView(e.size.width);
    });
    if (user.nightMode && !user.backgroundTile)
        $('#dashboard__full-view .background img').attr('src', '/files/svg/grid-black.svg');
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
        const _folder = event.target;
        const cardId = event.relatedTarget.id;
        const folderId = event.target.id;

        _folder.classList.remove('selected-dropzone');
        folder.find(folderId).addCard(cardId);
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
            var target = event.target;
            setTimeout(() => target.setAttribute('dragging', 'false'), 50);
        }
    }
});

function dragMoveListener (event) {
    var target = event.target;
    if ($(target).find('.dashboard__pin').hasClass('active'))
        return;

    target.setAttribute('dragging', 'true');

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