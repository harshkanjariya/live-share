let auth = firebase.auth();

function signin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
    auth.getRedirectResult()
        .then(function (result) {
        })
        .error(function (e) {
        });
}

let db = firebase.database().ref();

let currentOpened;
let myEmail;

auth.onAuthStateChanged(function (user) {
    if (user) {
        myEmail = user.email.replaceAll('.', ',');
        db.child('/user/' + myEmail).once('value', function (snap) {
            currentOpened = 'Public';
            if (snap.exists()) {
                let v = snap.val();
                if (v.open) {
                    currentOpened = v.open;
                } else {
                    db.child('/user/' + myEmail).set({
                        open: 'Public'
                    });
                }
            } else {
                db.child('/user/' + myEmail).set({
                    open: 'Public'
                });
            }
            db.child('/user').once('value', (snap) => {
                let userList = snap.val();
                console.log(userList);
                let $ul = $('.user-list');
                if (currentOpened === 'Public') {
                    $ul.html('<li class="active">Public</li>');
                } else {
                    $ul.html('<li>Public</li>');
                }
                for (let user in userList) {
                    if (user === myEmail) continue;

                    let e = user.replaceAll(',', '.');
                    if (user === currentOpened) {
                        $ul.append(`<li class="active">${e}</li>`);
                    } else {
                        $ul.append(`<li>${e}</li>`);
                    }
                }
                $('li', $ul).click(function () {
                    $('li', $ul).removeClass('active');
                    $(this).addClass('active');
                    currentOpened = this.innerHTML.replaceAll('.', ',');
                    db.child('/user/' + myEmail + '/open').set(currentOpened);
                    onUserChange();
                });
                onUserChange();
            });
        });
    } else {
        signin();
    }
});

let $menu = $('.menu');
$('.menu-btn').click(function () {
    $menu.toggleClass('active');
});

let currentNode;

function changed(e) {
    currentNode.set(e.value);
}

function onUserChange() {
    if (currentNode)
        currentNode.off();
    else if (!currentOpened)
        currentOpened = 'Public';
    if (currentOpened === 'Public')
        currentNode = db.child('public');
    else {
        let nd = currentOpened + '_' + myEmail;
        if (currentOpened.localeCompare(myEmail) === -1)
            nd = myEmail + '_' + currentOpened;
        currentNode = db.child('all/' + nd);
    }
    currentNode.on('value', (snap) => {
        $('textarea').val(snap.val());
    });
}

console.log('version 1.0.0');
