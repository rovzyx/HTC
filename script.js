(() => {
    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];
    let users = {}, currentUser = null;

    function loadUsers() {
        users = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('user_')) {
                const uname = key.slice(5);
                users[uname] = JSON.parse(localStorage.getItem(key));
            }
        }
    }

    function saveUser(u) {
        localStorage.setItem('user_' + u.username, JSON.stringify(u));
    }

    const hash = pw => btoa(pw);

    function showPage(id) {
        $$('.page').forEach(p => p.classList.add('hidden'));
        $(id).classList.remove('hidden');
        $$('.nav-links a').forEach(a => {
            a.classList.toggle('active', ('#' + a.dataset.page) === id);
        });
    }

    // Auth
    const authMsg    = $('#authMessage');
    const loginForm  = $('#loginForm');
    const signupForm = $('#signupForm');
    const tabLogin   = $('#tabLogin');
    const tabSignup  = $('#tabSignup');
    const nav        = $('#mainNav');
    const logoutBtn  = $('#logoutBtn');

    tabLogin.onclick = () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
        authMsg.textContent = '';
    };
    tabSignup.onclick = () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        authMsg.textContent = '';
    };

    // Expanded default missions + system‑wide missions
    function getDefaultMissions(age) {
        const common = [
            { title: 'Watch a budget tutorial',    category: 'Education', xpReward: 10, pointsReward: 0 },
            { title: 'Check today’s exchange rate', category: 'Education', xpReward: 5, pointsReward: 0 },
            { title: 'Spring Clean Your Finances',  category: 'Seasonal',  xpReward: 30, pointsReward: 30 },
            { title: 'Holiday Budget Challenge',    category: 'Seasonal',  xpReward: 40, pointsReward: 40 },
            { title: '7-Day Savings Streak',        category: 'Habit',     xpReward: 50, pointsReward: 50 },
            { title: 'Daily Expense Log (30 days)', category: 'Habit',     xpReward: 60, pointsReward: 60 },
            { title: 'Refer a Friend',              category: 'Community', xpReward: 20, pointsReward: 20 },
            { title: 'Squad Savings Challenge',     category: 'Community', xpReward: 50, pointsReward: 50 },
            { title: 'Tax Season Prep',             category: 'Learning',  xpReward: 25, pointsReward: 0 },
            { title: 'Investing 101 Quiz',          category: 'Learning',  xpReward: 25, pointsReward: 0 },
            { title: 'Rent vs. Buy Calculator',     category: 'LifeEvent', xpReward: 30, pointsReward: 0 },
            { title: 'Insurance Review',            category: 'LifeEvent', xpReward: 30, pointsReward: 0 }
        ];
        if (age < 16) {
            return [
                { title: 'Save $5 daily',              category: 'Savings',   xpReward: 20, pointsReward: 5 },
                { title: 'Read 1 finance article',     category: 'Education', xpReward: 15, pointsReward: 0 },
                { title: 'Watch 2 budget tutorials',   category: 'Education', xpReward: 20, pointsReward: 0 },
                { title: 'Open youth savings account', category: 'Savings',   xpReward: 30, pointsReward: 30 },
                { title: 'Learn what credit is',       category: 'Education', xpReward: 10, pointsReward: 0 },
                { title: 'Set aside $10 for charity',  category: 'Personal',  xpReward: 10, pointsReward: 10 },
                ...common
            ];
        } else if (age < 19) {
            return [
                { title: 'Track spending for 7 days',    category: 'Education', xpReward: 20, pointsReward: 10 },
                { title: 'Save $100 this month',         category: 'Savings',   xpReward: 40, pointsReward: 40 },
                { title: 'Open student TFSA',            category: 'Investing', xpReward: 30, pointsReward: 30 },
                { title: 'Create weekly budget plan',    category: 'Education', xpReward: 25, pointsReward: 0 },
                { title: 'Automate savings transfer',    category: 'Savings',   xpReward: 35, pointsReward: 35 },
                { title: 'Read about compound interest', category: 'Education', xpReward: 15, pointsReward: 0 },
                ...common
            ];
        } else if (age < 23) {
            return [
                { title: 'Invest in mutual‑fund simulator', category: 'Investing', xpReward: 40, pointsReward: 40 },
                { title: 'Set up emergency fund',           category: 'Savings',   xpReward: 60, pointsReward: 60 },
                { title: 'Read one finance book',           category: 'Education', xpReward: 15, pointsReward: 0 },
                { title: 'Complete budgeting course',       category: 'Education', xpReward: 30, pointsReward: 0 },
                { title: 'Pay down a small debt',           category: 'Savings',   xpReward: 50, pointsReward: 50 },
                { title: 'Open RESP for future',            category: 'Investing', xpReward: 25, pointsReward: 25 },
                ...common
            ];
        } else {
            return [
                { title: 'Review retirement plan',         category: 'Investing', xpReward: 70, pointsReward: 70 },
                { title: 'Donate 1% of income',            category: 'Personal',  xpReward: 20, pointsReward: 20 },
                { title: 'Set up RRSP contribution',       category: 'Investing', xpReward: 60, pointsReward: 60 },
                { title: 'Meet with a financial advisor',  category: 'Education', xpReward: 30, pointsReward: 30 },
                { title: 'Diversify investment portfolio', category: 'Investing', xpReward: 50, pointsReward: 50 },
                { title: 'Read about tax strategies',      category: 'Education', xpReward: 20, pointsReward: 0 },
                ...common
            ];
        }
    }

    // Require login
    function requireLogin() {
        loadUsers();
        currentUser = localStorage.getItem('currentUser');
        if (!currentUser || !users[currentUser]) {
            localStorage.removeItem('currentUser');
            nav.classList.add('hidden');
            showPage('#auth');
            return false;
        }
        const u = users[currentUser];

        // seed dummy purchase history if empty
        if (!u.purchaseHistory || u.purchaseHistory.length === 0) {
            u.purchaseHistory = [
                { date:'2025-04-18', item:'Coffee',       amount: 5.00 },
                { date:'2025-04-17', item:'Lunch',        amount: 12.00 },
                { date:'2025-04-16', item:'Streaming',    amount: 9.99 },
                { date:'2025-04-15', item:'Groceries',    amount: 45.23 },
                { date:'2025-04-14', item:'Movie Ticket', amount: 11.50 },
                { date:'2025-04-13', item:'Gas',          amount: 30.00 },
                { date:'2025-04-12', item:'Book',         amount: 15.75 },
                { date:'2025-04-11', item:'Restaurant',   amount: 60.40 }
            ];
        }

        u.depositHistory ||= [];
        saveUser(u);
        loadUsers();
        nav.classList.remove('hidden');
        showPage('#dashboard');
        refreshDashboard();
        return true;
    }

    // SIGNUP
    signupForm.onsubmit = e => {
        e.preventDefault();
        loadUsers();
        const uname = $('#signupUser').value.trim();
        const pwd   = $('#signupPass').value;
        const age   = parseInt($('#signupAge').value, 10);
        if (!uname || users[uname]) {
            authMsg.textContent = 'Invalid or taken username.';
            return;
        }
        let min, max;
        if (age < 16)      { min = 0;    max = 200; }
        else if (age < 19) { min = 200;  max = 1000; }
        else if (age < 23) { min = 1000; max = 5000; }
        else               { min = 5000; max = 20000; }
        const bankBalance = Math.floor(Math.random() * (max - min + 1)) + min;

        const newUser = {
            username: uname,
            password: hash(pwd),
            age,
            points: 0, xp: 0, level: 1, badges: 0,
            missions: getDefaultMissions(age).map(m => ({
                id: 'd_' + Date.now() + Math.random(),
                ...m, completed: false, createdBy: 'system'
            })),
            friends: [], redeemedRewards: [], totalPointsEarned: 0,
            achievements: [], purchaseHistory: [], depositHistory: [],
            bankBalance
        };
        saveUser(newUser);
        localStorage.setItem('currentUser', uname);
        loadUsers();
        requireLogin();
    };

    // LOGIN
    loginForm.onsubmit = e => {
        e.preventDefault();
        loadUsers();
        const uname = $('#loginUser').value.trim();
        const pwd   = $('#loginPass').value;
        if (!users[uname] || users[uname].password !== hash(pwd)) {
            authMsg.textContent = 'Invalid credentials.';
            return;
        }
        localStorage.setItem('currentUser', uname);
        loadUsers();
        requireLogin();
    };

    // LOGOUT
    logoutBtn.onclick = () => {
        localStorage.removeItem('currentUser');
        requireLogin();
    };

    // NAVIGATION
    $$('.nav-links a').forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            if (!requireLogin()) return;
            showPage('#' + link.dataset.page);
            switch (link.dataset.page) {
                case 'dashboard':    refreshDashboard();   break;
                case 'missions':     loadMissions();       break;
                case 'friends':      renderLeaderboard();  break;
                case 'rewards':      loadRewards();        break;
                case 'achievements': loadAchievements();   break;
                case 'guides':       loadGuides();         break;
                case 'profile':      loadProfile();        break;
            }
        };
    });

    // — DASHBOARD —
    const userNameDisplay  = $('#userNameDisplay');
    const pointsDisplay    = $('#pointsDisplay');
    const levelDisplay     = $('#levelDisplay');
    const badgesDisplay    = $('#badgesDisplay');
    const xpProgressFill   = $('#xpProgressFill');
    const xpProgressText   = $('#xpProgressText');
    const smartSuggestion  = $('#smartSuggestionText');
    const addSuggestionBtn = $('#addSuggestionBtn');
  
    function refreshDashboard(){
      const u = users[currentUser];
      userNameDisplay.textContent = u.username;
      pointsDisplay.textContent   = u.points;
      levelDisplay.textContent    = u.level;
      badgesDisplay.textContent   = u.badges;
      const xpNext = u.level*100;
      const xpPct  = Math.min(100,(u.xp/xpNext)*100);
      xpProgressFill.style.width = xpPct+'%';
      xpProgressText.textContent = `XP: ${u.xp} / ${xpNext}`;
  
      ['Savings','Investing','Education'].forEach(cat=>{
        const el    = $(`#tree${cat}`);
        const done  = u.missions.filter(m=>m.category===cat && m.completed).length;
        const stage = done>=3 ? 'full' : done>=1 ? 'sapling' : 'seed';
        el.src = `.vscode/images/tree_${cat.toLowerCase()}_${stage}.png`;
        el.alt = `${cat} tree (${stage})`;
      });
  
      const s = generateSuggestion(u);
      smartSuggestion.textContent = s.text;
      addSuggestionBtn.disabled   = false;
      addSuggestionBtn.textContent = 'Add as Mission';
      addSuggestionBtn.onclick     = ()=>{
        s.mission.id        = 'sugg_'+Date.now();
        s.mission.completed = false;
        s.mission.createdBy = 'system';
        u.missions.push(s.mission);
        saveUser(u);
        addSuggestionBtn.textContent='Added!';
        addSuggestionBtn.disabled=true;
      };
    }
  
    function generateSuggestion(u){
      if(u.purchaseHistory.length){
        const last=u.purchaseHistory[0];
        return {
          text:`You spent $${last.amount} on ${last.item}. Try saving that amount!`,
          mission:{
            title:`Save $${last.amount} instead of ${last.item}`,
            category:'Savings',
            xpReward:last.amount*2,
            pointsReward:last.amount*2
          }
        };
      }
      if(u.age<16) return {text:'Save $5 weekly.', mission:{title:'Save $5 weekly',category:'Savings',xpReward:20,pointsReward:20}};
      if(u.age<19) return {text:'Automate $50 saving.',mission:{title:'Automate $50 saving',category:'Savings',xpReward:40,pointsReward:40}};
      if(u.age<23) return {text:'Invest in ETF simulator.',mission:{title:'Invest in ETF simulator',category:'Investing',xpReward:50,pointsReward:50}};
      return {text:'Donate 1% income.', mission:{title:'Donate 1% income',category:'Personal',xpReward:20,pointsReward:20}};
    }
  
    // — MISSIONS —
    const missionsList      = $('#missionsList');
    const openAddMissionBtn = $('#openAddMissionModal');
    const addMissionModal   = $('#addMissionModal');
    const cancelAddMission  = $('#cancelAddMission');
    const addMissionForm    = $('#addMissionForm');
  
    openAddMissionBtn.onclick = ()=>addMissionModal.classList.remove('hidden');
    cancelAddMission.onclick  = ()=>addMissionModal.classList.add('hidden');
    addMissionForm.onsubmit   = e=>{
      e.preventDefault();
      const title= $('#newMissionTitle').value.trim();
      const cat  = $('#newMissionCategory').value;
      if(!title) return;
      const u = users[currentUser];
      u.missions.push({
        id:'u_'+Date.now(), title, category:cat,
        xpReward:10, pointsReward:10,
        completed:false, createdBy:currentUser
      });
      saveUser(u);
      loadMissions();
      addMissionModal.classList.add('hidden');
    };
  
    function loadMissions(){
      const u=users[currentUser];
      missionsList.innerHTML='';
      u.missions.forEach(m=>{
        const card=document.createElement('div');
        card.className='mission-card'+(m.completed?' done':'');
        card.dataset.category=m.category;
        card.innerHTML=`
          <h3>${m.title}<span class="category-tag">${m.category}</span></h3>
          <p>Reward: +${m.pointsReward} pts, +${m.xpReward} XP</p>
          <button class="complete-btn" ${m.completed?'disabled':''}>
            ${m.completed?'Completed':'Mark Complete'}
          </button>
        `;
        card.querySelector('.complete-btn').onclick=()=>{
          if(!m.completed){
            m.completed=true;
            const u=users[currentUser];
            u.points+=m.pointsReward;
            u.xp+=m.xpReward;
            u.totalPointsEarned+=m.pointsReward;
            if(u.xp>=u.level*100) u.level++;
            saveUser(u);
            loadMissions();
          }
        };
        missionsList.appendChild(card);
      });
      $$('.filter-btn').forEach(b=>{
        b.onclick=()=>{
          $$('.filter-btn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          const f=b.dataset.filter;
          $$('.mission-card').forEach(c=>{
            c.style.display=(f==='all'||c.dataset.category===f)?'block':'none';
          });
        };
      });
    }
  
    // — FRIENDS / LEADERBOARD —
    const friendInput     = $('#friendNameInput');
    const inviteFriendBtn = $('#inviteFriendBtn');
    const inviteStatusMsg = $('#inviteStatusMsg');
  
    function renderLeaderboard(){
      const u=users[currentUser];
      let list=[{name:currentUser,points:u.points,isUser:true}];
      u.friends.forEach(fn=>list.push({name:fn,points:(users[fn]||{points:0}).points}));
      list.sort((a,b)=>b.points-a.points);
      const tbody=$('#leaderboardBody');
      tbody.innerHTML='';
      list.forEach((e,i)=>{
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${i+1}</td><td>${e.name}${e.isUser?' (You)':''}</td><td>${e.points}</td>`;
        if(e.isUser) tr.classList.add('highlight');
        tbody.appendChild(tr);
      });
      const msg=$('#leaderboardMsg');
      if(list.length<2) msg.textContent='Add friends to compete!';
      else{
        const rank=list.findIndex(e=>e.isUser)+1;
        if(rank===1) msg.textContent="You're #1 – great job!";
        else{
          const diff=list[rank-2].points-u.points;
          msg.textContent=`You are #${rank}. ${diff} pts to catch ${list[rank-2].name}.`;
        }
      }
    }
  
    inviteFriendBtn.onclick=()=>{
      const fn=friendInput.value.trim(), u=users[currentUser];
      if(!fn||fn===currentUser||u.friends.includes(fn)){
        inviteStatusMsg.textContent='Invalid or already added.';return;
      }
      u.friends.push(fn);
      if(users[fn]){
        users[fn].friends=users[fn].friends||[];
        if(!users[fn].friends.includes(currentUser)){
          users[fn].friends.push(currentUser);
          saveUser(users[fn]);
        }
      }
      saveUser(u);
      renderLeaderboard();
      inviteStatusMsg.textContent=`Added ${fn}!`;
    };
  
    // — REWARDS —
    const rewardsGrid   = $('#rewardsGrid');
    const redeemModal   = $('#redeemModal');
    const redeemMsg     = $('#redeemMessage');
    const confirmRedeem = $('#confirmRedeem');
    const cancelRedeem  = $('#cancelRedeem');
    const rewardsList   = [
      {id:'r1',name:'$5 Coffee Card',cost:100},
      {id:'r2',name:'Budget e-Book', cost:50}
    ];
    let selectedReward=null;
  
    function loadRewards(){
      const u=users[currentUser];
      $('#pointsBalance').textContent=u.points;
      rewardsGrid.innerHTML='';
      rewardsList.forEach(r=>{
        const owned=u.redeemedRewards.includes(r.id);
        const dis=owned||u.points<r.cost;
        const card=document.createElement('div');
        card.className='reward-card';
        card.innerHTML=`
          <h3>${r.name}</h3>
          <p>Cost: ${r.cost} pts</p>
          <button class="redeem-btn" ${dis?'disabled':''} data-id="${r.id}">
            ${owned?'Redeemed':'Redeem'}
          </button>
        `;
        card.querySelector('button').onclick=()=>{
          selectedReward=r;
          redeemMsg.textContent=`Redeem "${r.name}" for ${r.cost} points?`;
          redeemModal.classList.remove('hidden');
        };
        rewardsGrid.appendChild(card);
      });
    }
  
    confirmRedeem.onclick=()=>{
      const u=users[currentUser];
      u.points-=selectedReward.cost;
      u.redeemedRewards.push(selectedReward.id);
      saveUser(u);
      redeemModal.classList.add('hidden');
      loadRewards();
    };
    cancelRedeem.onclick=()=>redeemModal.classList.add('hidden');
  
    // — ACHIEVEMENTS —
    function loadAchievements(){
      const u=users[currentUser];
  
      // Missions Completed
      const mDone=u.missions.filter(m=>m.completed).length;
      const mThresh=[1,5,10,20];
      const mNext=mThresh.find(t=>mDone<t)||mThresh.at(-1);
      $('#missionsCompletedCount').textContent=mDone;
      $('#missionNext').textContent=mNext;
      $('#missionTierLabel').textContent=
        mDone>=20?'Platinum':mDone>=10?'Gold':mDone>=5?'Silver':mDone>=1?'Bronze':'None';
      $('#missionProgressFill').style.width=Math.min(100,mDone/mNext*100)+'%';
  
      // Points Earned
      const pts=u.totalPointsEarned;
      const pThresh=[100,500,1000,5000];
      const pNext=pThresh.find(t=>pts<t)||pThresh.at(-1);
      $('#pointsEarnedCount').textContent=pts;
      $('#pointsNext').textContent=pNext;
      $('#pointsTierLabel').textContent=
        pts>=5000?'Platinum':pts>=1000?'Gold':pts>=500?'Silver':pts>=100?'Bronze':'None';
      $('#pointsProgressFill').style.width=Math.min(100,pts/pNext*100)+'%';
  
      // Friends Invited
      const fCount=u.friends.length;
      const fThresh=[1,3,5,10];
      const fNext=fThresh.find(t=>fCount<t)||fThresh.at(-1);
      $('#friendsCount').textContent=fCount;
      $('#friendsNext').textContent=fNext;
      $('#friendsTierLabel').textContent=
        fCount>=10?'Platinum':fCount>=5?'Gold':fCount>=3?'Silver':fCount>=1?'Bronze':'None';
      $('#friendsProgressFill').style.width=Math.min(100,fCount/fNext*100)+'%';
  
      // Deposits Made
      const dCount=u.depositHistory.length;
      const dThresh=[1,5,10];
      const dNext=dThresh.find(t=>dCount<t)||dThresh.at(-1);
      $('#depositsCount').textContent=dCount;
      $('#depositsNext').textContent=dNext;
      $('#depositsTierLabel').textContent=
        dCount>=10?'Gold':dCount>=5?'Silver':dCount>=1?'Bronze':'None';
      $('#depositsProgressFill').style.width=Math.min(100,dCount/dNext*100)+'%';
  
      // Rewards Redeemed
      const rCount=u.redeemedRewards.length;
      const rThresh=[1,3,5];
      const rNext=rThresh.find(t=>rCount<t)||rThresh.at(-1);
      $('#rewardsCount').textContent=rCount;
      $('#rewardsNext').textContent=rNext;
      $('#rewardsTierLabel').textContent=
        rCount>=5?'Gold':rCount>=3?'Silver':rCount>=1?'Bronze':'None';
      $('#rewardsProgressFill').style.width=Math.min(100,rCount/rNext*100)+'%';
  
      // Custom Missions
      const cCount=u.missions.filter(m=>m.createdBy===currentUser).length;
      const cThresh=[1,5,10];
      const cNext=cThresh.find(t=>cCount<t)||cThresh.at(-1);
      $('#customCount').textContent=cCount;
      $('#customNext').textContent=cNext;
      $('#customTierLabel').textContent=
        cCount>=10?'Gold':cCount>=5?'Silver':cCount>=1?'Bronze':'None';
      $('#customProgressFill').style.width=Math.min(100,cCount/cNext*100)+'%';
  
      // Streak Master (Habit missions completed)
      const streakCount=u.missions.filter(m=>m.category==='Habit'&&m.completed).length;
      const streakThresh=[1,2,3];
      const streakNext=streakThresh.find(t=>streakCount<t)||streakThresh.at(-1);
      $('#streakCount').textContent=streakCount;
      $('#streakNext').textContent=streakNext;
      $('#streakTierLabel').textContent=
        streakCount>=3?'Gold':streakCount>=2?'Silver':streakCount>=1?'Bronze':'None';
      $('#streakProgressFill').style.width=Math.min(100,streakCount/streakNext*100)+'%';
  
      // Community Builder (Community missions)
      const commCount=u.missions.filter(m=>m.category==='Community'&&m.completed).length;
      const commThresh=[1,5,10];
      const commNext=commThresh.find(t=>commCount<t)||commThresh.at(-1);
      $('#communityCount').textContent=commCount;
      $('#communityNext').textContent=commNext;
      $('#communityTierLabel').textContent=
        commCount>=10?'Gold':commCount>=5?'Silver':commCount>=1?'Bronze':'None';
      $('#communityProgressFill').style.width=Math.min(100,commCount/commNext*100)+'%';
  
      // Learning Champion (Education & Learning missions)
      const learnCount=u.missions.filter(m=>['Education','Learning'].includes(m.category)&&m.completed).length;
      const learnThresh=[3,7,15];
      const learnNext=learnThresh.find(t=>learnCount<t)||learnThresh.at(-1);
      $('#learningCount').textContent=learnCount;
      $('#learningNext').textContent=learnNext;
      $('#learningTierLabel').textContent=
        learnCount>=15?'Gold':learnCount>=7?'Silver':learnCount>=3?'Bronze':'None';
      $('#learningProgressFill').style.width=Math.min(100,learnCount/learnNext*100)+'%';
  
      // Milestone Saver (Bank balance)
      const bal=u.bankBalance||0;
      const msThresh=[1000,5000,10000];
      const msNext=msThresh.find(t=>bal<t)||msThresh.at(-1);
      $('#milestoneCount').textContent=bal;
      $('#milestoneNext').textContent=msNext;
      $('#milestoneTierLabel').textContent=
        bal>=10000?'Gold':bal>=5000?'Silver':bal>=1000?'Bronze':'None';
      $('#milestoneProgressFill').style.width=Math.min(100,bal/msNext*100)+'%';
  
      // Holiday Hero (Holiday Budget Challenge)
      const holDone = u.missions.find(m=>m.title==='Holiday Budget Challenge'&&m.completed)?1:0;
      $('#holidayCount').textContent=holDone;
      $('#holidayNext').textContent=1;
      $('#holidayTierLabel').textContent=
        holDone?'Bronze':'None';
      $('#holidayProgressFill').style.width=holDone*100+'%';
    }
  
    // — GUIDES —
    const guidesList = $('#guidesList');
    const guides = [
      { title:'Budget Basics',    desc:'Learn how to create and stick to a budget.',      url:'#' },
      { title:'Credit Score 101', desc:'Understand what affects your credit score.',    url:'#' },
      { title:'Saving Strategies',desc:'Effective ways to build and grow savings.',     url:'#' }
    ];
    function loadGuides(){
      guidesList.innerHTML='';
      guides.forEach(g=>{
        const card=document.createElement('div');
        card.className='mission-card';
        card.innerHTML=`
          <h3>${g.title}</h3>
          <p>${g.desc}</p>
          <a href="${g.url}" target="_blank">Read More</a>
        `;
        guidesList.appendChild(card);
      });
    }
  
    // — PROFILE —
    function loadProfile(){
      const u=users[currentUser];
      $('#profileName').textContent=u.username;
      $('#profileEmail').textContent=u.username+'@Scotia.ca';
      $('#profileAge').textContent=u.age;
      $('#profileLevel').textContent=u.level;
  
      // Bank balance
      const balance = u.bankBalance||0;
      $('#profileBankBalance').textContent=balance.toLocaleString();
      let min,max;
      if(u.age<16){min=0;max=200;}
      else if(u.age<19){min=200;max=1000;}
      else if(u.age<23){min=1000;max=5000;}
      else{min=5000;max=20000;}
      const pct=Math.round((balance-min)/(max-min)*100);
      $('#balanceFill').style.width=pct+'%';
      $('#balancePctText').textContent=`${pct}% of your goal of $${max.toLocaleString()}`;
  
      // Deposit
      const depositInput = $('#depositAmount');
      const depositBtn   = $('#depositBtn');
      const depositMsg   = $('#depositMsg');
      depositMsg.textContent='';
      depositBtn.onclick=()=>{
        const amt=parseFloat(depositInput.value);
        if(isNaN(amt)||amt<=0){
          depositMsg.textContent='Enter a valid amount.';return;
        }
        u.bankBalance+=amt;
        const today=new Date().toISOString().split('T')[0];
        u.depositHistory.push({date:today,amount:amt});
        saveUser(u);
        loadUsers();
        $('#profileBankBalance').textContent=u.bankBalance.toLocaleString();
        const newPct=Math.round((u.bankBalance-min)/(max-min)*100);
        $('#balanceFill').style.width=newPct+'%';
        $('#balancePctText').textContent=`${newPct}% of your goal of $${max.toLocaleString()}`;
        depositMsg.textContent='Deposit successful!';
        depositInput.value='';
        renderDepositHistory();
      };
  
      function renderDepositHistory(){
        const tbody=$('#depositHistoryTable tbody');
        tbody.innerHTML='';
        (u.depositHistory||[]).forEach(d=>{
          const tr=document.createElement('tr');
          tr.innerHTML=`<td>${d.date}</td><td>${d.amount.toFixed(2)}</td>`;
          tbody.appendChild(tr);
        });
      }
      renderDepositHistory();
  
      // Purchase history
      const tbodyPH=$('#purchaseHistoryTable tbody');
      tbodyPH.innerHTML='';
      (u.purchaseHistory||[]).forEach(tr=>{
        const row=document.createElement('tr');
        row.innerHTML=`<td>${tr.date}</td><td>${tr.item}</td><td>${tr.amount.toFixed(2)}</td>`;
        tbodyPH.appendChild(row);
      })
      ;
    }
  
    // INITIALIZE
    loadUsers();
    requireLogin();
  })();
  