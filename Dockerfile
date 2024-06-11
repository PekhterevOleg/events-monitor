# Используем официальный образ Node.js версии 20 в качестве базового
FROM node:20


# Устанавливаем рабочую директорию
WORKDIR /app


# Копируем package.json и package-lock.json для установки зависимостей Node.js
COPY package*.json ./

ENV TZ=Asia/Yekaterinburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y tzdata

# Устанавливаем зависимости Node.js
RUN npm install


# Копируем остальные файлы проекта
COPY . .


# Указываем порт, который будет использоваться приложением
EXPOSE 3000


# Определяем команду для запуска приложения
CMD ["node", "main.js"]