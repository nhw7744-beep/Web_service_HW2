const express  = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 로딩미들웨어
app.use((req, res, next) => {
    console.log(`mid_Time:`, Date.now());
    next(); 
});

//ID 관리
const USERS = {
    "user@game.com": "123",
    "admin@game.com": "456"
};

// ACCOUNTS 데이터 구조 (title 필드 추가)
const ACCOUNTS = {
    "user": { id: "user", lv: "1", titleId: "TESTTT", titleName: null },
    "admin": { id: "admin", lv: "99", titleId: "9SP9LV", titleName: "만렙 용사" }
};

//칭호관리
const AVAILABLE_TITLES = {
    "9SP9LV": "만렙 용사",
    "TESTTT": "테스트용더미칭호"
};

let gameRooms = {};
let roomId = 19721121;

//GET 1 / 로그인 화면
app.get('/login', (req, res) => {
    console.log(`app_Time:`, Date.now());
    res.send(`
        <!DOCTYPE html>
        <h1>로그인</h1>
        <form method="POST" action="/login">
            <input type="email" name="email" placeholder="이메일을 입력하시오." required/>
            <br>
            <input type="password" name="password" placeholder="비밀번호를 입력하시오." required/>
            <br>
            <button type="submit">로그인</button>
        </form>
        <hr>
        <p><a href="/signup">회원가입</a></p>
    `);
});

//GET 2 / 사용자 화면
app.get('/users/:id', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const userId = req.params.id;
    const accountData = ACCOUNTS[userId];

    res.send(`
        <!DOCTYPE html>
        <h1>어서오시게 용사여</h1>
        <p>User ID: ${accountData.id}
            <br>LV: ${accountData.lv}
            <br>칭호: ${accountData.titleName}
        </p>
    `);
});

//GET 3 / 회원가입 화면
app.get('/signup', (req, res) => {
    console.log(`app_Time:`, Date.now());
    res.send(`
        <!DOCTYPE html>
        <h1>회원가입</h1>
        <form method="POST" action="/signup">
            <input type="email" name="email" placeholder="사용할 이메일을 적으세요." required/>
            <br>
            <input type="password" name="password" placeholder="사용할 비밀번호를 입력하시오." required/>
            <br>
            <button type="submit">가입하기</button>
        </form>
    `);
});

//POST 1 / 로그인_로그아웃
app.post('/login', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const {email, password} = req.body;

    //이메일 혹은 비밀번호 존재X
    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: '이메일과 비밀번호를 모두 입력해야 합니다.'
        });
    }

    //이메일 정보가 DB에 X
    if (!USERS[email]) {
        return res.status(401).json({
            success: false,
            message: '등록되지 않은 사용자 이메일입니다.'
        });
    }

    //로그인 성공!
    if (USERS[email] == password) {
        const userID = email.split('@')[0]
        return res.status(302).redirect(`/users/${userID}`);
    } 

    //로그인 실패...
    else {
        return res.status(401).json({
            success: false,
            message: '비밀번호가 일치하지 않습니다.'
        });
    }
});

//POST 2 / 회원가입
app.post('/signup', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const { email, password } = req.body;

    //이메일 혹은 비밀번호 존재X
    if(!email || !password){
        return res.status(400).json({
            success: false,
            message: '이메일과 비밀번호를 모두 입력해야 합니다.'
        });
    }

    //중복이메일
    if (USERS[email]) {
        return res.status(409).json({
            success: false,
            message: '이미 등록된 이메일입니다.'
        });
    }

    //회원 등록
    USERS[email] = password; 
    console.log('새로운 사용자 등록:', email, USERS); 
    
    //로그인 페이지로 이동
    return res.status(201).send(`
        <h1>회원가입 성공!</h1>
        <p><strong>${email}</strong>님, 환영합니다.</p>
        <script>setTimeout(() => { window.location.href = '/login'; }, 2000);</script>
    `);
});

//PUT 1 / 게임 방만들기
app.put('/rooms/:roomId', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const roomId = req.params.roomId;
    const { masterId, maxPlayers } = req.body;

    // 이미 존재하는 방 생성
    if (gameRooms[roomId]) {
        return res.status(409).json({
            success: false,
            message: `생성 실패: 잠시후 다시 이용해주세요.`
        });
    }

    // 새 방 생성
    gameRooms[roomId] = {
        id: roomId,
        masterId: masterId,
        maxPlayers: maxPlayers || 2,
        players: [masterId],
        createdAt: new Date().toISOString()
    };
    console.log(`새로운 방 생성: ${roomId}`, gameRooms[roomId]);

    return res.status(201).json({
        success: true,
        message: `게임방 "${roomId}"이(가) 성공적으로 생성되었습니다.`,
        data: gameRooms[roomId]
    });
});

//PUT 2 / 칭호 생성
app.put('/users/:userId', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const userId = req.params.userId;
    const { titleId } = req.body;

    //사용자 소실
    if (!ACCOUNTS[userId]) {
        return res.status(404).json({
            success: false,
            message: `사용자를 찾을 수 없습니다.`,
        });
    }

    //존재하지 않은 칭호ID
    const titleName = AVAILABLE_TITLES[titleId];
    if (!titleName) {
        return res.status(400).json({
            success: false,
            message: `유효하지 않은 칭호입니다.`,
        });
    }
    
    //칭호 변경
    const updatedAccount = {
        ...ACCOUNTS[userId], 
        titleId: titleId,
        titleName: titleName
    };
    ACCOUNTS[userId] = updatedAccount;
    
    console.log(`사용자 ${userId}의 칭호가 ${titleName}으로 갱신되었습니다.`);

    return res.status(200).json({
        success: true,
        message: `칭호가 "${titleName}"(으)로 갱신되었습니다.`,
        data: updatedAccount
    });
});

//DELETE 1 / 게임 방 삭제
app.delete('/rooms/:roomId', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const roomId = req.params.roomId;

    //존재하지 않는 방
    if (!gameRooms[roomId]) {
        console.log(`삭제 실패: 방 ${roomId}을(를) 찾을 수 없습니다.`);
        return res.status(404).json({
            success: false,
            message: `삭제할 게임 방 ID(${roomId})를 찾을 수 없습니다.`,
        });
    }

    //방 삭제 성공
    delete gameRooms[roomId];
    console.log(`게임 방 삭제 완료: ${roomId}`, gameRooms);

    return res.status(204).end();
});

//DELETE 2 / 회원 삭제
app.delete('/users/:id', (req, res) => {
    console.log(`app_Time:`, Date.now());
    const userId = req.params.id;
    const userEmail = Object.keys(USERS).find(key => key.split('@')[0] === userId);

    //존재하지 않는 사용자
    if (!userEmail) {
        console.log(`삭제 실패: 사용자 ID ${userId}를 찾을 수 없음`);
        return res.status(404).json({ 
            success: false, 
            message: `삭제할 사용자를 찾을 수 없습니다.`,
        });
    }

    //사용자 삭제 성공
    delete USERS[userEmail];
    console.log(`사용자 계정 삭제 완료: ${userEmail}`, USERS); 

    return res.status(204).end(); 
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/login`);
});