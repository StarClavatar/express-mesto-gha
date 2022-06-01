// Массив доменов, с которых разрешены кросс-доменные запросы
const allowedCors = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'http://clavatar.nomoreparties.sbs',
  'localhost:3000',
];

// Значение для заголовка Access-Control-Allow-Methods по умолчанию (разрешены все типы запросов)
// const DEFAULT_ALLOWED_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE';

module.exports = (req, res, next) => {
  const { origin } = req.headers;
  const { method } = req;
  const requestHeaders = req.headers['access-control-request-headers'];

  // проверяем, что источник запроса есть среди разрешённых
  if (allowedCors.includes(origin)) {
    if (method === 'OPTIONS') {
      res.header('Access-Control-Allow-Headers', requestHeaders);
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }

  return next(); // пропускаем запрос дальше
};
