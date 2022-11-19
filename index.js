// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3UE5DuA2rqoVO1FoOHtN7iYYS-3AtCpU",
    authDomain: "todolist-573c2.firebaseapp.com",
    projectId: "todolist-573c2",
    storageBucket: "todolist-573c2.appspot.com",
    messagingSenderId: "605089114759",
    appId: "1:605089114759:web:0d77111d972b0b5c2ee622"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let usuario = null;
let novoususario = false;

function logado() {
    document.querySelector('.login h2').innerText = `Olá ${usuario.displayName}, Você esta conectado`;
    document.querySelector('.login .form-content').style.display = 'none';
    document.querySelector('.login .error').style.display = 'none';
    document.querySelector('.login .error').innerText = '';
    document.querySelector('.login button').innerText = 'Deslogar!';
    let em = document.querySelector('.login .login-email');
    em.style.display = 'block';
    em.innerText = usuario.email;
    document.querySelector('form[name=login]').reset();
    document.querySelector('.tarefas').style.display = 'block';
    toast('logado com sucesso...');
    document.querySelector('.login .new-acout').style.display = 'none';
    let ul = document.querySelector('.tarefas ul');
    ul.innerHTML = '';

    db.collection('tarefas').where('userId', '==', usuario.uid).onSnapshot(d => {

        let docs = d.docs;

        docs.sort((a, b) => {
            if (a.time < b.time) return -1;
            else return 1;
        });

        let ul = document.querySelector('.tarefas ul');
        ul.innerHTML = '';
        d.docs.map(e => {
            ul.innerHTML += `<li>${e.data().tarefa}<span tarefa-id='${e.id}'>X</span></li>`;
        })

        let exc = document.querySelectorAll('.tarefas li span');
        exc.forEach(elem => {
            elem.addEventListener('click', (e) => {
                e.preventDefault();
                let docId = elem.getAttribute('tarefa-id');
                db.collection('tarefas').doc(docId).delete();
                toast('Tarefa excluida com sucesso...');
            })
        })
    });
}

document.querySelector('form[name=login]').addEventListener('submit', (e) => {
    e.preventDefault();
    if (usuario != null) {
        firebase.auth().signOut().then();
        document.querySelector('.login h2').innerText = "Faça o Login no App!";
        document.querySelector('.login .form-content').style.display = 'block';
        document.querySelector('.login .error').style.display = 'block';
        document.querySelector('.login button').innerText = 'Logar!';
        let em = document.querySelector('.login .login-email');
        em.style.display = 'none';
        usuario = null;
        document.querySelector('.tarefas').style.display = 'none';
        document.querySelector('.login .new-acout').style.display = 'block';
        toast('usuario deslogado...');
        return;
    }

    let name = document.querySelector('input[name=name]').value;
    let email = document.querySelector('input[name=email]').value;
    let pass = document.querySelector('input[name=password]').value;
    let auth = firebase.auth();

    if (novoususario) {
        auth.createUserWithEmailAndPassword(email, pass).then((userCredential) => {
            var user = userCredential.user;
            user.updateProfile({
                displayName: name,
            });
            toast('usuario criado...');
            novoususario = false;
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            document.querySelector('.login .error').innerText = errorMessage;
        });

    } else {
        auth.signInWithEmailAndPassword(email, pass).then((userCredential) => {
            usuario = userCredential.user;
            logado();
        }).catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            document.querySelector('.login .error').innerText = errorMessage;
        });
    }

});

document.querySelector('.login .new-acout').addEventListener('click', () => {

    if (novoususario) {
        document.querySelector('.login label.name').style.display = 'none';
        document.querySelector('.login h2').innerText = 'Faça Login no App!';
        document.querySelector('.login button').innerText = 'Login!';
        document.querySelector('.login .new-acout').innerText = 'Fazer login!';
        novoususario = false;
    } else {
        novoususario = true;
        document.querySelector('.login label.name').style.display = 'inline';
        document.querySelector('.login h2').innerText = 'Criar Novo Usuario!';
        document.querySelector('.login button').innerText = 'Criar!';
        document.querySelector('.login .new-acout').innerText = 'Fazer login!';
    }
})


firebase.auth().onAuthStateChanged(user => {
    if (user == null) return;
    usuario = user;
    logado();
})

document.querySelector('form[name=tarefas]').addEventListener('submit', (e) => {
    e.preventDefault();
    let text = document.querySelector('.tarefas input[type=text]').value;
    let date = document.querySelector('.tarefas input[type=datetime-local]').value;
    if (text == '' || date == '') return;
    db.collection('tarefas').add({
        tarefa: text,
        time: new Date(date).getTime(),
        userId: usuario.uid
    })

    document.querySelector('form[name=tarefas]').reset();
    toast('tarefa adicionada com sucesso...');
});


function toast(msg) {
    let div = document.querySelector('.msg');
    div.style.display = 'block';
    div.innerText = msg;
    setTimeout(() => {
        div.style.display = 'none';
        div.innerText = '';
    }, 2000);
}