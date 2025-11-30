# Web_service_HW2

가상 웹 게임 서버 사이트를 디자인하였습니다.

아래 있는 코드는 테스트 샘플입니다.

POST1 (회원 가입) = http://localhost:3000/signup
{
  "email": "nomail@game.com",
  "password": 123
}

POST2 (invalid 회원 로그인) = http://localhost:3000/ login
{
  "email": "user@game.com",
  "password": "password"
}

PUT1 (방 만들기) = http://localhost:3000/rooms/19721121
{
  "masterId": "user",
  "maxPlayers": "2"
}

PUT2 (칭호 생성) = http://localhost:3000/users/user
{
  "userId": "user",
  "titleId": "TESTTT"
}

DELETE1 (방 삭제) = http://localhost:3000/rooms/19721121
{
  "roomId": 19721121
}
(!반드시 방 만들기 후 삭제하기)

DELETE2 (회원 탈퇴) = http://localhost:3000/users/user
{
  "userId": "user",
  "userEmail": "user@game.com"
}
  
