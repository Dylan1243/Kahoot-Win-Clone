var socket=null;const MessageHandler={Error:{INVALID_USER_INPUT:()=>{console.log("WS Message ERR: 无效的用户输入")},INVALID_PIN:()=>(new LoginPage(!1),new ErrorHandler("PIN码无效")),MAX_SESSION_COUNT:()=>{setTimeout(()=>{new ErrorHandler("您的IP地址当前连接了太多会话/标签。"),activateLoading(!0,!0,"会话过多。 请稍候。"),setTimeout(()=>{resetGame()},3e4)},5e3)},INVALID_NAME:e=>(clearTimeout(game.handshakeTimeout),"Duplicate name"!==e.description?(new ErrorHandler("连接失败: "+(e.error||e)),new LoginPage):(new ErrorHandler("名称无效。"),new LoginPage(!0))),SESSION_NOT_CONNECTED:()=>{new ErrorHandler("您还不能这样做； 您尚未加入游戏。")},EMPTY_NAME:()=>{new ErrorHandler("没有提供测验名称。 在提供此信息之前，服务器不会搜索。")},HANDSHAKE:()=>{let e;switch(clearTimeout(game.handshakeTimeout),new ErrorHandler("与Kahoot服务器的连接被阻止。 ¯\\_(ツ)_/¯"),document.getElementById("handshake-fail-div")&&(document.getElementById("handshake-fail-div").outerHTML=""),detectPlatform()){case"Windows":e="https://www.mediafire.com/file/ju7sv43qn9pcio6/kahoot-win-win.zip/file";break;case"MacOS":e="https://www.mediafire.com/file/bcvxlwlfvbswe62/Kahoot_Winner.dmg/file";break;default:e="https://www.mediafire.com/file/zb5blm6a8dyrwtb/kahoot-win-linux.tar.gz/file"}const t=document.createElement("div");t.innerHTML=`<span>嗯，我们似乎在遇到麻烦。 尝试<span class="mobihide">下载我们的应用程序或</span>按下下面的报告按钮！</span>\n      <br>\n      <a class="mobihide" href="${e}" onclick="dataLayer.push({event:'download_app'})" target="_blank">下载应用程式</a>\n      <br>\n      <button onclick="send({type:'HANDSHAKE_ISSUES',message:'AAAA!'});this.innerHTML = '已报告问题。';this.onclick = null;dataLayer.push({event:'report_error'});" title="此按钮可能会减少重置服务器的时间。">报告问题</button>`,t.id="handshake-fail-div",t.style="\n        position: fixed;\n        top: 4rem;\n        z-index: 1000;\n        width: 100%;\n        color: white;\n        background: #888;\n        text-align: center;\n        border-radius: 5rem;\n      ",document.body.append(t)}},Message:{SetName:e=>{document.getElementById("loginInput").value=e},PinGood:e=>{const t=e.match(/\d+/g)[0];t!=game.pin&&(game.pin=t);try{TutorialDiv.innerHTML=""}catch(e){}return new LoginPage(!0)},JoinSuccess:e=>("Music"===game.theme&&game.playSound("/resource/music/lobby.m4a"),e=JSON.parse(e),game.cid=e.cid,game.quizEnded=!1,dataLayer.push({event:"join_game"}),activateLoading(!1,!1),clearTimeout(game.handshakeTimeout),new LobbyPage),QuizStart:()=>{try{game.music.pause()}catch(e){}return new QuizStartPage},QuestionGet:e=>{const t=JSON.parse(e);return new GetReadyPage(t)},QuestionBegin:e=>(game.questionAnswered=!1,new QuestionAnswererPage(JSON.parse(e))),QuestionSubmit:e=>(game.questionAnswered=!0,new QuestionSnarkPage(e)),QuestionEnd:e=>{try{game.music.pause()}catch(e){}return new QuestionEndPage(e)},QuizFinish:e=>{game.quizEnded=!0,game.end.info=JSON.parse(e),dataLayer.push(Object.assign({event:"quiz_finish"},JSON.parse(e)))},FinishText:e=>("Music"===game.theme&&game.playSound("/resource/music/podium.m4a"),new QuizEndPage(e)),QuizEnd:e=>(game.quizEnded=!0,resetGame(),setTimeout((function(){new ErrorHandler("测验结束或被踢。 ("+e+")")}),300)),RunTwoSteps:()=>(game.two=[],new TwoStepPage),Ping:()=>{console.log("Recieved ping from server")},FailTwoStep:()=>new TwoStepPage(!0),TwoStepSuccess:()=>new LobbyPage,Maintainance:e=>new ErrorHandler("Maintainance Alert: "+e),OK:()=>{game.ready=!0},GameReset:()=>{new LobbyPage,delete game.question,delete game.guesses,delete game.answers,delete game.rawData,delete game.ans,delete game.got_answers,game.index=0,game.streak=0,game.score=0,game.quizEnded=!1},NameAccept:e=>{const t=JSON.parse(e);game.name=t.playerName;try{document.getElementById("L2").innerHTML=`<p>${t.playerName}</p>`}catch(e){}},TimeOver:()=>{new TimeUpPage},Feedback:()=>{new FeedbackPage},TeamTalk:e=>{new TeamTalkPage(JSON.parse(e))}}};class Game{constructor(){this.socket=null,this.oldQuizUUID="",this.name="",this.streak=0,this.ready=!1,this.cid="",this.pin=0,this.score=0,this.answers=[],this.quizEnded=!0,this.total=0,this.index=0,this.end={},this.two=[],this.errorTimeout=null,this.jumbleAnswer=[],this.multiAnswer={0:!1,1:!1,2:!1,3:!1},this.theme="Kahoot",this.opts={},this.correctIndex=null,this.questionStarted=!1,this.questionAnswered=!1}sendPin(pin){return new Promise(res=>{this.pin=pin,grecaptcha.ready(()=>{grecaptcha.execute("6LcyeLEZAAAAAGlTegNXayibatWwSysprt2Fb22n",{action:"submit"}).then(token=>{this.socket=new WebSocket(`${"http:"==location.protocol?"ws://":"wss://"}${location.host}?token=${token}`),socket=this.socket,socket.onmessage=evt=>{evt=evt.data;let data=JSON.parse(evt);if("Error"==data.type)return MessageHandler.Error[data.message](data.data);eval(`MessageHandler.${data.type}("${data.message.replace(/\\/gim,"\\\\").replace(/"/gim,'\\"')}")`)},socket.onclose=()=>{game.disconnectTime=Date.now(),new ErrorHandler("Session disconnected."),activateLoading(!0,!0,"<br><br><br><br><p>Reconnecting</p>");let e=0;!function t(n){const a=new XMLHttpRequest;a.open("GET","/up"),a.send(),a.onerror=a.ontimeout=function(){if(++e>10)return location.href="https://theusaf.github.io/kahoot%20winner%20error.html";(n*=2)>30&&(n=30),setTimeout((function(){t(n)}),1e3*n)},a.onload=function(){if(200!=a.status||!/^-?\d+ (hours|minutes) until expected reset.*$/.test(a.response))return a.onerror(n);activateLoading(!1,!1),game.quizEnded||"0"==game.pin[0]?resetGame():resetGame(!0)}}(.5)},socket.onopen=()=>{const e=setInterval(()=>{this.ready&&(res(),send({type:"SET_PIN",message:pin}),this.loadOptions(),clearInterval(e))},500)}})}),activateLoading(!0,!0)})}join(e){this.name=e,send({type:"JOIN_GAME",message:e}),activateLoading(!0,!0),this.handshakeTimeout=setTimeout(()=>{let e;switch(document.getElementById("handshake-fail-div")&&(document.getElementById("handshake-fail-div").outerHTML=""),MessageHandler.Error.HANDSHAKE(),detectPlatform()){case"Windows":e="https://www.mediafire.com/file/ju7sv43qn9pcio6/kahoot-win-win.zip/file";break;case"MacOS":e="https://www.mediafire.com/file/bcvxlwlfvbswe62/Kahoot_Winner.dmg/file";break;default:e="https://www.mediafire.com/file/zb5blm6a8dyrwtb/kahoot-win-linux.tar.gz/file"}const t=document.createElement("div");t.innerHTML=`<span>嗯，我们似乎在遇到麻烦。 尝试<span class="mobihide">下载我们的应用程序或</span>按下下面的报告按钮！</span>\n      <br>\n      <a href="${e}" onclick="dataLayer.push({event:'download_app'})" target="_blank">下载应用程式</a>`,t.className="shortcut",t.id="handshake-fail-div",t.style="\n        position: fixed;\n        top: 4rem;\n        z-index: 1000;\n        width: 100%;\n        color: white;\n        background: #888;\n        text-align: center;\n        border-radius: 5rem;\n      ",document.body.append(t)},1e4)}getRandom(){dataLayer.push({event:"get_random_name"}),send({type:"GET_RANDOM_NAME",message:"please?"})}saveOptions(){const e=SettingDiv.querySelectorAll("input,select"),t={};for(let n=0;n<e.length;++n)t[e[n].id]="checkbox"==e[n].type?e[n].checked:e[n].value;localStorage.options=JSON.stringify({manual:t.manual,timeout:t.timeout,brute:t.brute,fail:t.fail,teamtalk:t.teamtalk,teamMembers:t.teamMembers,theme:t.theme,previewQuestion:t.previewQuestion,searchLoosely:t.searchLoosely,ChallengeDisableAutoplay:t.ChallengeDisableAutoplay,div_game_options:t.div_game_options,div_search_options:t.div_search_options,div_challenge_options:t.div_search_options});const n=game.opts;game.theme=t.theme,game.opts=t,send({type:"SET_OPTS",message:JSON.stringify(t)}),game.questionStarted&&!game.questionAnswered&&n.manual&&!game.opts.manual&&send({type:"ANSWER_QUESTION",message:null})}loadOptions(){let e;try{e=JSON.parse(localStorage.options),game.opts=e,game.theme=e.theme}catch(e){return}if(e){for(let t in e){const n=document.getElementById(t);"checkbox"==n.type?n.checked=e[t]:n.value=e[t]}if(socket&&1===socket.readyState)return game.saveOptions(),dataLayer.push(Object.assign({event:"load_options"},e)),new ErrorHandler("恢复的选项！",!0);null!==socket&&setTimeout(()=>{this.loadOptions()},3e3)}}answer(e){activateLoading(!0,!0),send({type:"ANSWER_QUESTION",message:e}),dataLayer.push({event:"answer",value:e,type:this.question.type})}answer2(e,t){if(t.className="faded",-1==this.two.indexOf(e))return this.two.push(e),4==this.two.length?(send({type:"DO_TWO_STEP",message:JSON.stringify(this.two)}),void activateLoading(!0,!0,"")):void 0}answerJ(e){let t=[];for(let n=0;n<e.length;n++)t.push(Number(e[n].getAttribute("index")));this.answer(t)}answerM(e,t){this.multiAnswer[e]=!this.multiAnswer[e],-1!=t.className.indexOf("correct")?t.className=this.multiAnswer[e]?"fadedm correct":"correct":t.className=this.multiAnswer[e]?"fadedm":""}updateName(){clearTimeout(this.saveTimeout),this.saveTimeout=setTimeout(this.saveOptions,500)}playSound(e){this.music||(this.music=new Audio,this.music.addEventListener("ended",()=>{this.music.currentTime=0,this.music.play()})),this.music.pause(),this.music.src=e,this.music.play()}}function send(e){null!==socket&&socket.send(JSON.stringify(e))}function setCookie(e){document.cookie=`lang=${e}; expires=${new Date(Date.now()+31536e6).toGMTString()}; path=/`,"serviceWorker"in navigator?navigator.serviceWorker.getRegistrations().then((async function(t){for(let e of t)await e.unregister();location.href="en"!==e?"/"+e:"/"})).catch(()=>{location.href="en"!==e?"/"+e:"/"}):location.href="en"!==e?"/"+e:"/"}let game=new Game,egg="";const eggstyle=document.createElement("style");function detectPlatform(){let e="Linux";return-1!=navigator.appVersion.indexOf("Win")&&(e="Windows"),-1!=navigator.appVersion.indexOf("Mac")&&(e="MacOS"),-1!=navigator.appVersion.indexOf("X11")&&(e="UNIX"),-1!=navigator.appVersion.indexOf("Linux")&&(e="Linux"),e}eggstyle.innerHTML="p,.sm span,img,h1,h2,.About h3,.tut_cont h3,h4{\n  animation: infinite windance 1s;\n}",window.addEventListener("load",()=>{game.loadOptions(),game.theme=ThemeChooser.value,"Kahoot"!=game.theme&&new LoginPage,"Rainbow"==game.theme&&(SettingDiv.className="rainbow correct",document.querySelector(".About").className="About rainbow")}),window.addEventListener("keydown",e=>{"Escape"==e.key&&(0==closePage?SettingSwitch.click():1==closePage?AboutSwitch.click():ChangelogSwitch.click()),egg+=e.key;try{if(0!="winner".search(egg)){egg="";try{document.body.removeChild(eggstyle)}catch(e){}}else"winner"==egg&&document.body.append(eggstyle)}catch(e){egg=""}}),localStorage.KW_Version="v3.1.0";const checkVersion=new XMLHttpRequest;checkVersion.open("GET","/up"),checkVersion.send(),checkVersion.onload=function(){const e=checkVersion.response.split(": ")[1],t=localStorage.KW_Version||e;if("false"!=localStorage.KW_Update){if(e!=t){const t=document.createElement("div");t.id="UpdateDiv",t.innerHTML='<h2>有新的更新。</h2>\n    <h4>您要现在更新吗？</h4>\n    <p>如果此消息持续出现，请尝试刷新页面或清除缓存。</p>\n    <button id="UpdateYes">是</button><button id="UpdateNo">还没</button><br>\n    <button onclick="localStorage.KW_Update = false;this.parentElement.outerHTML = \'\';">禁用更新通知</button>',document.body.append(t),document.getElementById("UpdateYes").onclick=function(){"serviceWorker"in navigator?(document.getElementById("UpdateYes").innerHTML="请稍候...",navigator.serviceWorker.getRegistrations().then((async function(t){for(let e of t)await e.unregister();setTimeout((function(){localStorage.KW_Version=e,location.reload()}),3e3)})).catch((function(){document.getElementById("UpdateDiv").outerHTML="",new ErrorHandler("强制更新时出错。 请手动清除或重新加载页面缓存。")}))):(document.getElementById("UpdateDiv").outerHTML="",new ErrorHandler("强制更新时出错。 请手动清除或重新加载页面缓存。"))},document.getElementById("UpdateNo").onclick=function(){document.getElementById("UpdateDiv").outerHTML=""}}localStorage.KW_Version||(localStorage.KW_Version=e)}};