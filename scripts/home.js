(()=>{

    // const { electron, ipcRenderer } = require('electron');
    const { electron, ipcRenderer } = require('electron');
    // const ipcRenderer = electron.ipcRenderer;
    const userIdInput = document.getElementById('user-id-input');
    const userPasswordInput = document.getElementById('user-password-input');
    const signInButton = document.getElementById('button-SignIn');
    const signUpButton = document.getElementById('button-SignUp');
    const logoutButton = document.getElementById('button-logout');

    signInButton.addEventListener('click', function(){
        
        const id = userIdInput.value;
        const password = userPasswordInput.value;

        if (id == '' || password == '') return false;
        const data = {
          id:id,
          password:password
        };
        const returnVal = ipcRenderer.sendSync('logInRequest',data);
        if(returnVal == 'invalid'){
            // alert("아이디 패스워드를 확인하세요.")
            console.log("invalid")
        } else {

            ipcRenderer.send('displayWaitDialog',returnVal);

        }
    });


        
    ipcRenderer.on('login-Success', (arg) => {
        // console.log(arg)
        ipcRenderer.send('displayWaitDialog',message);
        if(arg == 'invalid')
        {
            // alert("아이디 패스워드를 확인하세요.")
        } 
    })

    ipcRenderer.on('login-Failed', (arg) => {
        console.log(arg) 
    })

      

    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('keyup', (e) => {
        if (e.keyCode == 13){
            // signInButton.click();
            console.log("enter");
        }
    })

    })();