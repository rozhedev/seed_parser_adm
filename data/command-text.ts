import { INIT_DATA } from "./init-data";

export const COMMAND_TEXT = {
    start: "Запуск бота",
    gentoken: "Генерация нового токена",
    showtokenlist: "Показать список токенов",
}

export const ANSWER_TEXT = {
    startMessage: `Админка для управления клиентами\. Сайт расположен <b><a href="${INIT_DATA.domain}">здесь</a></b>`,
    token: {
        enterName: `Введите имя токена, например: <i>Тамара 42 Волгоград</i>`,
        created: "Созданные токены:",
        chooseFromList: "Выбери токен для дальнейших действий",
        actions: "<b>&#8595; Действия &#8595;</b>",
        editName: "Введите новое имя токена, например: <i>Иван 34 Тула</i>",
        successChangedName: "Имя токена изменено",
        enterSeed: "Введите seed для отправки",
    },
    exit: {
        toList: "Вернулся к списку:",
        toMenu: "Вернулся к меню:",
    },
    delete: {
        confirm: "Точно хочешь удалить запись?",
        success: "Данные удалены. Новый список:",
        canceled: "Удаление отменено. Текущий список:",
    },
    status: {
        searchStarted: {
            yes: "<i><b>В процессе поиска</b></i>",
            no: "<i><b>Не начал поиск</b></i>",
        },
        seedSended: {
            yes: "<i><b>seed-фразу отправили</b></i>",
            no: "<i><b>seed-фраза не отправлена</b></i>",
            finished: "Фраза отправлена, поиск в пользователя остановлен",
        },
    },
};
