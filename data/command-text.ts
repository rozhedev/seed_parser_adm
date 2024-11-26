import { INIT_DATA } from "./constants";

export const COMMAND_TEXT = {
    str_cmd__start: "Запуск бота",
    str_cmd__genToken: "Генерация нового токена",
    str_cmd__showTokenList: "Показать список токенов",
};

export const ANSWER_TEXT = {
    str__startMessage: `Админка для управления клиентами\. Сайт расположен <b><a href="${INIT_DATA.domain}">здесь</a></b>`,
    str__token: {
        enterName: `Введите уникальное имя токена, например: <i>Тамара 42 Волгоград</i>`,
        created: "Созданные токены:",
        chooseFromList: "Выбери токен для дальнейших действий",
        actions: "<b>&#8595; Действия &#8595;</b>",
        editName: "Введите новое имя токена, например: <i>Иван 34 Тула</i>",
        successChangedName: "Имя токена изменено",
        enterSeed: "Введите seed для отправки (12 слов через пробел)",
    },
    str__exit: {
        toList: "Вернулся к списку:",
        toMenu: "Вернулся в меню:",
    },
    str__delete: {
        confirm: "Точно хочешь удалить запись?",
        success: "Данные удалены. Новый список:",
        canceled: "Удаление отменено. Текущий список:",
    },
    str__searchStarted: {
        yes: "<i><b>В процессе поиска</b></i>",
        no: "<i><b>Не начал поиск</b></i>",
    },
    str__seedSended: {
        yes: "<i><b>seed-фразу отправили</b></i>",
        no: "<i><b>seed-фраза не отправлена</b></i>",
        finished: "Фраза отправлена, поиск в пользователя остановлен",
    },
};

export const ERR_TEXT = {
    str_err__msgSended: "Бот не понимает сообщений, пользуйся кнопками",
    str_err__tokenListEmpty: "Токены не добавлены",
    str_err__tokenNotFound: "Токен отсутствует",
};
