FROM node:21

# 复制 package.json 并安装依赖
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# 复制应用代码
COPY . .

# 启动应用
CMD [ "node", "main.js" ]