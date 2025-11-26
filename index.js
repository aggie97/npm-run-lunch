// 1. 주요 클래스 가져오기
const { Client, Events, GatewayIntentBits } = require("discord.js");
// import discord from "discord.js";
// import token from "./config.json";
const { token } = process.env.DISCORD_TOKEN;

if (!token) {
  console.error("ERROR: DISCORD_TOKEN 환경 변수가 설정되지 않았습니다.");
  process.exit(1); // 토큰이 없으면 프로그램 종료
}

const fs = require("fs"); // 👈 File System 모듈 추가

const DATA_FILE = "menus.json"; // 데이터 파일명 정의
let menus = []; // 메뉴 데이터를 저장할 변수를 let으로 선언

/**
 * menus.json 파일에서 데이터를 로드하는 함수
 * @returns {Array} 로드된 메뉴 배열
 */
function loadMenus() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf8");
    console.log(`${DATA_FILE} 파일 로드 성공.`);
    return JSON.parse(data);
  } catch (error) {
    // 파일이 없거나(ENOENT) JSON 파싱 오류가 발생했을 경우
    console.error(
      `ERROR: ${DATA_FILE} 파일을 로드할 수 없습니다. 초기 데이터를 사용합니다.`,
      error.message
    );

    // ⚠️ 파일 로드 실패 시 사용할 초기 데이터를 여기에 넣습니다.
    const initialMenus = [
      {
        store: "기본메뉴_1",
        menu: "테스트용 메뉴",
      },
      {
        store: "기본메뉴_2",
        menu: "테스트용 메뉴 2",
      },
    ];
    // 초기 데이터를 파일에 저장해 둡니다. (다음 로드 시 오류 방지)
    saveMenus(initialMenus);
    return initialMenus;
  }
}

/**
 * 현재 menus 배열을 menus.json 파일에 저장하는 함수
 * @param {Array} data 저장할 메뉴 배열 (생략 시 현재 전역 menus 변수 사용)
 */
function saveMenus(data = menus) {
  try {
    const jsonString = JSON.stringify(data, null, 2); // 보기 좋게 들여쓰기 2칸으로 저장
    fs.writeFileSync(DATA_FILE, jsonString, "utf8");
    console.log(`${DATA_FILE} 파일 저장 성공.`);
  } catch (error) {
    console.error(
      "ERROR: 메뉴 파일을 저장하는 데 실패했습니다.",
      error.message
    );
  }
}

// 봇 시작 시 메뉴 데이터 로드
menus = loadMenus();

// 2. 클라이언트 객체 생성 (Guilds관련, 메시지관련 인텐트 추가)
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 3. 봇이 준비됐을때 한번만(once) 표시할 메시지
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
  let index = parseInt(Math.random() * menus.length);
  const { store, menu, url } = menus[index];
  if (["점메추", "저메추"].includes(message.content)) {
    if (parseInt(Math.random() * 10) === 0) {
      message.reply("귀찮으니까 알아서 쳐먹어줘~?");
    }

    message.reply(store + " 어때~?");

    if (menu) message.reply("특히 " + menu + " 이거 존맛탱이야..");
    if (url) message.reply(url);
  }

  if (message.content.startsWith("메뉴 추가")) {
    const [cmd, store, url, menu] = message.content.split(" ");

    const newMenuItem = {
      store,
      url,
      menu: menu ?? null,
    };

    // `menus` 배열에 추가
    menus.push(newMenuItem);

    // 💡 변경 사항: 배열에 추가 후 즉시 파일에 저장!
    saveMenus(menus);

    // 사용자에게 확인 메시지 전송
    let replyMessage = `✅ **${newStore}** 메뉴가 추가됐어 덴지쿤! (현재 메뉴 총 ${menus.length}개)`;

    if (newMenu) {
      replyMessage += `\n> 메뉴설명: ${newMenu}`;
    }
    if (newUrl) {
      replyMessage += `\n> URL: ${newUrl}`;
    }

    message.reply(replyMessage);

    console.log("새 메뉴 추가됨:", newMenuItem);
  }
});

// 5. 시크릿키(토큰)을 통해 봇 로그인 실행
client.login(token);
