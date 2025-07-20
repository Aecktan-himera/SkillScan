import { AppDataSource } from "./data-source";
import bcrypt from "bcrypt";
import { User } from "../entities/User";
import { Topic } from "../entities/Topic";
import { Question } from "../entities/Question";
import { TestHistory } from "../entities/TestHistory";
import { Option } from "../entities/Option";
import logger from "../utils/logger";

export async function seedInitialData() {
  const userRepository = AppDataSource.getRepository(User);

// Проверка, что база данных пустая (нет ни одного пользователя)
  const userCount = await userRepository.count();
  if (userCount > 0) {
    logger.info("Database is not empty. Skipping seeding.");
    return;
  }

  const topicRepository = AppDataSource.getRepository(Topic);
  const questionRepository = AppDataSource.getRepository(Question);
  const optionRepository = AppDataSource.getRepository(Option);

  // Проверка существования администратора
  let adminUser = await userRepository.findOne({ where: { email: "admin@example.com" } });
  
  if (!adminUser) {
    adminUser = new User();
    adminUser.username = "admin";
    adminUser.email = "admin@example.com";
    adminUser.password = await bcrypt.hash("adminpassword", 10);
    adminUser.role = "admin";
    await userRepository.save(adminUser);
    logger.info("Admin user created");
  }

  // Базовые темы
  const topicsData = [
    { name: "HTML", description: "Основы верстки" },
    { name: "CSS", description: "Основы CSS" },
    { name: "Javascript", description: "Основы Javascript" }
  ];

  // Создание или получение тем
  const topics: Topic[] = [];
  for (const topicData of topicsData) {
    let topic = await topicRepository.findOne({ where: { name: topicData.name } });
    if (!topic) {
      topic = new Topic();
      Object.assign(topic, topicData);
      await topicRepository.save(topic);
    }
    topics.push(topic);
  }
  
  if (topics.length > 0) {
    logger.info("Topics ready");
  }

  // Вопросы для HTML
  const htmlQuestions = [
    {
      text: "Что означает HTML?",
    explanation: "HTML - стандартный язык разметки для веб-страниц",
    difficulty: "easy",
    options: [
      { text: "HyperText Markup Language", isCorrect: true },
      { text: "Hyperlinks and Text Markup Language", isCorrect: false },
      { text: "Home Tool Markup Language", isCorrect: false },
      { text: "Hyper Transfer Markup Language", isCorrect: false }
    ]
  },
  {
    text: "Какой тег создает абзац?",
    explanation: "Тег <p> используется для определения абзаца",
    difficulty: "easy",
    options: [
      { text: "<p>", isCorrect: true },
      { text: "<par>", isCorrect: false },
      { text: "<text>", isCorrect: false },
      { text: "<paragraph>", isCorrect: false }
    ]
  },
  {
    text: "Какой атрибут делает поле обязательным?",
    explanation: "Атрибут required обеспечивает валидацию формы",
    difficulty: "medium",
    options: [
      { text: "required", isCorrect: true },
      { text: "mandatory", isCorrect: false },
      { text: "musthave", isCorrect: false },
      { text: "necessary", isCorrect: false }
    ]
  },
  {
    text: "Как создать выпадающий список?",
    explanation: "Теги <select> и <option> создают выпадающий список",
    difficulty: "medium",
    options: [
      { text: "<select>", isCorrect: true },
      { text: "<dropdown>", isCorrect: false },
      { text: "<list>", isCorrect: false },
      { text: "<options>", isCorrect: false }
    ]
  },
  {
    text: "Как вставить изображение?",
    explanation: "Тег <img> используется для вставки изображений",
    difficulty: "easy",
    options: [
      { text: "<img src='image.jpg'>", isCorrect: true },
      { text: "<image src='image.jpg'>", isCorrect: false },
      { text: "<picture src='image.jpg'>", isCorrect: false },
      { text: "<src='image.jpg'>", isCorrect: false }
    ]
  },
  {
    text: "Какой тег для заголовка самого высокого уровня?",
    explanation: "Тег <h1> представляет заголовок первого уровня",
    difficulty: "easy",
    options: [
      { text: "<h1>", isCorrect: true },
      { text: "<header>", isCorrect: false },
      { text: "<head>", isCorrect: false },
      { text: "<title>", isCorrect: false }
    ]
  },
  {
    text: "Как создать нумерованный список?",
    explanation: "Тег <ol> создает упорядоченный (нумерованный) список",
    difficulty: "medium",
    options: [
      { text: "<ol>", isCorrect: true },
      { text: "<ul>", isCorrect: false },
      { text: "<list>", isCorrect: false },
      { text: "<dl>", isCorrect: false }
    ]
  },
  {
    text: "Какой тег определяет заголовок таблицы?",
    explanation: "Тег <th> определяет ячейку заголовка таблицы",
    difficulty: "medium",
    options: [
      { text: "<th>", isCorrect: true },
      { text: "<td>", isCorrect: false },
      { text: "<header>", isCorrect: false },
      { text: "<thead>", isCorrect: false }
    ]
  },
  {
    text: "Как создать ссылку?",
    explanation: "Тег <a> создает гиперссылки",
    difficulty: "easy",
    options: [
      { text: "<a href='https://example.com'>", isCorrect: true },
      { text: "<link href='https://example.com'>", isCorrect: false },
      { text: "<url href='https://example.com'>", isCorrect: false },
      { text: "<ref href='https://example.com'>", isCorrect: false }
    ]
  },
  {
    text: "Какой атрибут для подсказки при наведении?",
    explanation: "Атрибут title показывает всплывающую подсказку",
    difficulty: "medium",
    options: [
      { text: "title", isCorrect: true },
      { text: "tooltip", isCorrect: false },
      { text: "hint", isCorrect: false },
      { text: "popup", isCorrect: false }
    ]
  },
  {
    text: "Как вставить видео?",
    explanation: "Тег <video> добавляет видео-контент",
    difficulty: "medium",
    options: [
      { text: "<video src='movie.mp4'>", isCorrect: true },
      { text: "<movie src='movie.mp4'>", isCorrect: false },
      { text: "<media src='movie.mp4'>", isCorrect: false },
      { text: "<embed src='movie.mp4'>", isCorrect: false }
    ]
  },
  {
    text: "Как создать кнопку?",
    explanation: "Тег <button> создает кликабельную кнопку",
    difficulty: "easy",
    options: [
      { text: "<button>", isCorrect: true },
      { text: "<btn>", isCorrect: false },
      { text: "<input type='button'>", isCorrect: false },
      { text: "<click>", isCorrect: false }
    ]
  },
  {
    text: "Какой тег для мета-описания страницы?",
    explanation: "Тег <meta name='description'> содержит описание страницы",
    difficulty: "hard",
    options: [
      { text: "<meta name='description'>", isCorrect: true },
      { text: "<description>", isCorrect: false },
      { text: "<page-info>", isCorrect: false },
      { text: "<info>", isCorrect: false }
    ]
  },
  {
    text: "Как создать текстовое поле ввода?",
    explanation: "Тег <input type='text'> создает текстовое поле",
    difficulty: "easy",
    options: [
      { text: "<input type='text'>", isCorrect: true },
      { text: "<textfield>", isCorrect: false },
      { text: "<input type='string'>", isCorrect: false },
      { text: "<text>", isCorrect: false }
    ]
  },
  {
    text: "Какой тег для нижнего колонтитула?",
    explanation: "Тег <footer> определяет нижний колонтитул",
    difficulty: "medium",
    options: [
      { text: "<footer>", isCorrect: true },
      { text: "<bottom>", isCorrect: false },
      { text: "<foot>", isCorrect: false },
      { text: "<end>", isCorrect: false }
    ]
  }
];

  // Вопросы для CSS
  const cssQuestions = [
    {
      text: "Что означает CSS?",
    explanation: "CSS используется для стилизации веб-страниц",
    difficulty: "easy",
    options: [
      { text: "Cascading Style Sheets", isCorrect: true },
      { text: "Computer Style Sheets", isCorrect: false },
      { text: "Creative Style System", isCorrect: false },
      { text: "Colorful Style Sheets", isCorrect: false }
    ]
  },
  {
    text: "Как изменить цвет текста?",
    explanation: "Свойство color определяет цвет текста",
    difficulty: "easy",
    options: [
      { text: "color: red;", isCorrect: true },
      { text: "text-color: red;", isCorrect: false },
      { text: "font-color: red;", isCorrect: false },
      { text: "text: red;", isCorrect: false }
    ]
  },
  {
    text: "Как сделать элемент невидимым?",
    explanation: "display: none полностью удаляет элемент из потока документа",
    difficulty: "medium",
    options: [
      { text: "display: none;", isCorrect: true },
      { text: "visibility: hidden;", isCorrect: false },
      { text: "opacity: 0;", isCorrect: false },
      { text: "hidden: true;", isCorrect: false }
    ]
  },
  {
    text: "Как центрировать элемент по горизонтали?",
    explanation: "margin: 0 auto центрирует блочные элементы",
    difficulty: "medium",
    options: [
      { text: "margin: 0 auto;", isCorrect: true },
      { text: "align: center;", isCorrect: false },
      { text: "position: center;", isCorrect: false },
      { text: "center: true;", isCorrect: false }
    ]
  },
  {
    text: "Как изменить шрифт?",
    explanation: "Свойство font-family задает семейство шрифта",
    difficulty: "easy",
    options: [
      { text: "font-family: Arial;", isCorrect: true },
      { text: "font: Arial;", isCorrect: false },
      { text: "text-font: Arial;", isCorrect: false },
      { text: "font-name: Arial;", isCorrect: false }
    ]
  },
  {
    text: "Как создать гибкий макет?",
    explanation: "display: flex создает flex-контейнер",
    difficulty: "medium",
    options: [
      { text: "display: flex;", isCorrect: true },
      { text: "display: grid;", isCorrect: false },
      { text: "display: block;", isCorrect: false },
      { text: "layout: flex;", isCorrect: false }
    ]
  },
  {
    text: "Как добавить тень к элементу?",
    explanation: "box-shadow добавляет тень к блоку",
    difficulty: "medium",
    options: [
      { text: "box-shadow: 2px 2px 5px grey;", isCorrect: true },
      { text: "shadow: 2px 2px 5px grey;", isCorrect: false },
      { text: "element-shadow: 2px 2px 5px grey;", isCorrect: false },
      { text: "block-shadow: 2px 2px 5px grey;", isCorrect: false }
    ]
  },
  {
    text: "Как сделать анимацию?",
    explanation: "@keyframes определяет кадры анимации",
    difficulty: "hard",
    options: [
      { text: "@keyframes mymove {}", isCorrect: true },
      { text: "@animation mymove {}", isCorrect: false },
      { text: "@move mymove {}", isCorrect: false },
      { text: "@frames mymove {}", isCorrect: false }
    ]
  },
  {
    text: "Как изменить курсор?",
    explanation: "cursor: pointer меняет курсор на указатель",
    difficulty: "easy",
    options: [
      { text: "cursor: pointer;", isCorrect: true },
      { text: "mouse: pointer;", isCorrect: false },
      { text: "pointer: cursor;", isCorrect: false },
      { text: "cursor-style: pointer;", isCorrect: false }
    ]
  },
  {
    text: "Как сделать градиентный фон?",
    explanation: "linear-gradient создает линейный градиент",
    difficulty: "hard",
    options: [
      { text: "background: linear-gradient(red, yellow);", isCorrect: true },
      { text: "background: gradient(red, yellow);", isCorrect: false },
      { text: "background: color-gradient(red, yellow);", isCorrect: false },
      { text: "gradient: linear(red, yellow);", isCorrect: false }
    ]
  },
  {
    text: "Как сделать адаптивные изображения?",
    explanation: "max-width: 100% позволяет изображениям масштабироваться",
    difficulty: "medium",
    options: [
      { text: "img { max-width: 100%; }", isCorrect: true },
      { text: "img { width: auto; }", isCorrect: false },
      { text: "img { scale: responsive; }", isCorrect: false },
      { text: "img { responsive: true; }", isCorrect: false }
    ]
  },
  {
    text: "Как изменить прозрачность?",
    explanation: "opacity задает уровень прозрачности",
    difficulty: "easy",
    options: [
      { text: "opacity: 0.5;", isCorrect: true },
      { text: "transparency: 50%;", isCorrect: false },
      { text: "alpha: 0.5;", isCorrect: false },
      { text: "visible: 50%;", isCorrect: false }
    ]
  },
  {
    text: "Как повернуть элемент?",
    explanation: "transform: rotate() вращает элемент",
    difficulty: "medium",
    options: [
      { text: "transform: rotate(45deg);", isCorrect: true },
      { text: "rotate: 45deg;", isCorrect: false },
      { text: "rotation: 45deg;", isCorrect: false },
      { text: "element-rotate: 45deg;", isCorrect: false }
    ]
  },
  {
    text: "Как создать сетку?",
    explanation: "display: grid создает grid-контейнер",
    difficulty: "medium",
    options: [
      { text: "display: grid;", isCorrect: true },
      { text: "display: flex;", isCorrect: false },
      { text: "layout: grid;", isCorrect: false },
      { text: "grid: true;", isCorrect: false }
    ]
  },
  {
    text: "Как изменить межстрочное расстояние?",
    explanation: "line-height задает высоту строки текста",
    difficulty: "easy",
    options: [
      { text: "line-height: 1.5;", isCorrect: true },
      { text: "line-spacing: 1.5;", isCorrect: false },
      { text: "spacing: 1.5;", isCorrect: false },
      { text: "text-height: 1.5;", isCorrect: false }
    ]
  }
];

  // Вопросы для JavaScript
  const jsQuestions = [
    {
      text: "Как объявить переменную?",
    explanation: "var устарел, рекомендуется использовать let/const",
    difficulty: "easy",
    options: [
      { text: "let x;", isCorrect: true },
      { text: "variable x;", isCorrect: false },
      { text: "v x;", isCorrect: false },
      { text: "def x;", isCorrect: false }
    ]
  },
  {
    text: "Какой метод добавляет элемент в массив?",
    explanation: "Метод push добавляет элементы в конец массива",
    difficulty: "medium",
    options: [
      { text: "push()", isCorrect: true },
      { text: "append()", isCorrect: false },
      { text: "addToEnd()", isCorrect: false },
      { text: "insert()", isCorrect: false }
    ]
  },
  {
    text: "Как проверить тип данных?",
    explanation: "typeof возвращает строку с типом операнда",
    difficulty: "easy",
    options: [
      { text: "typeof variable", isCorrect: true },
      { text: "variable.type", isCorrect: false },
      { text: "type(variable)", isCorrect: false },
      { text: "variable.typeOf()", isCorrect: false }
    ]
  },
  {
    text: "Как создать объект?",
    explanation: "Объекты создаются с помощью фигурных скобок",
    difficulty: "easy",
    options: [
      { text: "const obj = {};", isCorrect: true },
      { text: "const obj = new Object();", isCorrect: false },
      { text: "const obj = [];", isCorrect: false },
      { text: "const obj = Object.create();", isCorrect: false }
    ]
  },
  {
    text: "Как выполнить код через время?",
    explanation: "setTimeout выполняет функцию после задержки",
    difficulty: "medium",
    options: [
      { text: "setTimeout(func, 1000)", isCorrect: true },
      { text: "delay(func, 1000)", isCorrect: false },
      { text: "wait(func, 1000)", isCorrect: false },
      { text: "setInterval(func, 1000)", isCorrect: false }
    ]
  },
  {
    text: "Как объявить функцию?",
    explanation: "Функции объявляются с помощью ключевого слова function",
    difficulty: "easy",
    options: [
      { text: "function myFunc() {}", isCorrect: true },
      { text: "func myFunc() {}", isCorrect: false },
      { text: "def myFunc() {}", isCorrect: false },
      { text: "myFunc: function() {}", isCorrect: false }
    ]
  },
  {
    text: "Как преобразовать строку в число?",
    explanation: "parseFloat преобразует строку в число с плавающей точкой",
    difficulty: "medium",
    options: [
      { text: "parseFloat('10.5')", isCorrect: true },
      { text: "String.toNumber('10.5')", isCorrect: false },
      { text: "'10.5'.toNumber()", isCorrect: false },
      { text: "Number.parse('10.5')", isCorrect: false }
    ]
  },
  {
    text: "Как найти элемент в массиве?",
    explanation: "find возвращает первый элемент, удовлетворяющий условию",
    difficulty: "medium",
    options: [
      { text: "array.find(callback)", isCorrect: true },
      { text: "array.search(callback)", isCorrect: false },
      { text: "array.filter(callback)", isCorrect: false },
      { text: "array.locate(callback)", isCorrect: false }
    ]
  },
  {
    text: "Что такое замыкание?",
    explanation: "Замыкание - функция, запоминающая внешние переменные",
    difficulty: "hard",
    options: [
      { text: "Функция + её лексическое окружение", isCorrect: true },
      { text: "Способ скрытия данных", isCorrect: false },
      { text: "Завершение работы функции", isCorrect: false },
      { text: "Специальный тип объекта", isCorrect: false }
    ]
  },
  {
    text: "Как работает оператор '==='?",
    explanation: "Строгое равенство без приведения типов",
    difficulty: "easy",
    options: [
      { text: "Сравнивает значения и типы", isCorrect: true },
      { text: "Сравнивает только значения", isCorrect: false },
      { text: "Сравнивает только типы", isCorrect: false },
      { text: "Приводит типы и сравнивает", isCorrect: false }
    ]
  },
  {
    text: "Как создать промис?",
    explanation: "Промисы создаются через конструктор Promise",
    difficulty: "hard",
    options: [
      { text: "new Promise((resolve, reject) => {})", isCorrect: true },
      { text: "Promise.create((resolve, reject) => {})", isCorrect: false },
      { text: "promise((resolve, reject) => {})", isCorrect: false },
      { text: "new Promise(resolve, reject => {})", isCorrect: false }
    ]
  },
  {
    text: "Как добавить класс элементу?",
    explanation: "classList.add добавляет класс DOM-элементу",
    difficulty: "medium",
    options: [
      { text: "element.classList.add('class')", isCorrect: true },
      { text: "element.addClass('class')", isCorrect: false },
      { text: "element.className += 'class'", isCorrect: false },
      { text: "element.classes.add('class')", isCorrect: false }
    ]
  },
  {
    text: "Что такое this?",
    explanation: "this ссылается на контекст выполнения функции",
    difficulty: "hard",
    options: [
      { text: "Контекст вызова функции", isCorrect: true },
      { text: "Ссылка на глобальный объект", isCorrect: false },
      { text: "Ссылка на родительский объект", isCorrect: false },
      { text: "Специальная переменная для классов", isCorrect: false }
    ]
  },
  {
    text: "Как обработать ошибку в промисах?",
    explanation: "catch обрабатывает отклоненные промисы",
    difficulty: "medium",
    options: [
      { text: ".catch(error => {})", isCorrect: true },
      { text: ".fail(error => {})", isCorrect: false },
      { text: ".error(error => {})", isCorrect: false },
      { text: ".reject(error => {})", isCorrect: false }
    ]
  },
  {
    text: "Как создать копию объекта?",
    explanation: "Object.assign создает поверхностную копию объекта",
    difficulty: "medium",
    options: [
      { text: "Object.assign({}, obj)", isCorrect: true },
      { text: "obj.copy()", isCorrect: false },
      { text: "{...obj}", isCorrect: false },
      { text: "JSON.parse(JSON.stringify(obj))", isCorrect: false }
    ]
  }
];

  // Сопоставление тем с вопросами
  const topicsWithQuestions = [
    { topic: "HTML", questions: htmlQuestions },
    { topic: "CSS", questions: cssQuestions },
    { topic: "Javascript", questions: jsQuestions }
  ];

  // Создание вопросов и вариантов ответов
  for (const { topic: topicName, questions } of topicsWithQuestions) {
    const topic = topics.find(t => t.name === topicName);
    if (!topic) continue;

    for (const questionData of questions) {
      // Проверка существования вопроса
      const existingQuestion = await questionRepository.findOne({
        where: { text: questionData.text },
        relations: ["options"]
      });

      if (!existingQuestion) {
        const question = new Question();
        question.text = questionData.text;
        question.explanation = questionData.explanation;
        question.difficulty = questionData.difficulty as any;
        question.topic = topic;
        question.createdBy = adminUser;
        
        const savedQuestion = await questionRepository.save(question);
        
        // Создание вариантов ответов
        const options = questionData.options.map(optData => {
          const option = new Option();
          option.text = optData.text;
          option.isCorrect = optData.isCorrect;
          option.question = savedQuestion;
          return option;
        });
        
        await optionRepository.save(options);
      }
    }
  }

  logger.info("Questions and options seeded successfully");

  // Создаем тестового пользователя
  let testUser = await userRepository.findOne({ where: { email: "user@example.com" } });
  
  if (!testUser) {
    testUser = new User();
    testUser.username = "testuser";
    testUser.email = "user@example.com";
    testUser.password = await bcrypt.hash("userpassword", 10);
    testUser.role = "user";
    await userRepository.save(testUser);
    logger.info("Test user created");
  }

  // Получаем репозиторий для истории тестов
  const testHistoryRepository = AppDataSource.getRepository(TestHistory);

  // Получаем темы для истории тестов
  const htmlTopic = topics.find(t => t.name === "HTML");
  const cssTopic = topics.find(t => t.name === "CSS");
  const jsTopic = topics.find(t => t.name === "Javascript");

  // Создаем записи истории тестирования
  if (htmlTopic && cssTopic && jsTopic) {
    // Первый тест (HTML)
    const test1 = new TestHistory();
    test1.user = testUser;
    test1.topic = htmlTopic;
    test1.score = 80;
    test1.timeSpent = 720; // 12 минут в секундах
    test1.answers = [
      {
        questionId: "550e8400-e29b-41d4-a716-446655440000", // фиктивный ID
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440001",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440002",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440003",
        isCorrect: false
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440004",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440005",
        isCorrect: false
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440006",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440007",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440008",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440009",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440010",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440011",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440012",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440013",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440014",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440015",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440016",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440017",
        isCorrect: true
      },
      {
        questionId: "550e8400-e29b-41d4-a716-446655440018",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440019",
        isCorrect: true
      },
    ];
    await testHistoryRepository.save(test1);

    // Второй тест (CSS)
    const test2 = new TestHistory();
    test2.user = testUser;
    test2.topic = cssTopic;
    test2.score = 100;
    test2.timeSpent = 900; // 15 минут в секундах
    test2.answers = [
      {
        questionId: "660e8400-e29b-41d4-a716-446655440000",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440001",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440002",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440003",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440004",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440005",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440006",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440007",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440008",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440009",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440010",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440011",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440012",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440013",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440014",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440015",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440016",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440017",
        isCorrect: true
      },
      {
        questionId: "660e8400-e29b-41d4-a716-446655440018",
        selectedOptionId: "660e8400-e29b-41d4-a716-446655440019",
        isCorrect: true
      },

    ];
    await testHistoryRepository.save(test2);

    // Третий тест (JavaScript)
    const test3 = new TestHistory();
    test3.user = testUser;
    test3.topic = jsTopic;
    test3.score = 90;
    test3.timeSpent = 600; // 10 минут в секундах
    test3.answers = [
      {
        questionId: "770e8400-e29b-41d4-a716-446655440000",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440001",
        isCorrect: false
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440002",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440003",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440004",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440005",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440006",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440007",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440008",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440009",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440010",
        selectedOptionId: "550e8400-e29b-41d4-a716-446655440011",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440012",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440013",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440014",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440015",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440016",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440017",
        isCorrect: true
      },
      {
        questionId: "770e8400-e29b-41d4-a716-446655440018",
        selectedOptionId: "770e8400-e29b-41d4-a716-446655440019",
        isCorrect: true
      },
    ];
    await testHistoryRepository.save(test3);
  }

  logger.info("Test history records created");

  logger.info("Initial data seeding completed");
}
