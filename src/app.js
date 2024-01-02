import express from 'express';
import cookieParser from 'cookie-parser';
import cors  from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());


//routes
import userRouter from './routes/user.routes.js';
import path from 'path';

//routes declaration 

app.use('/api/v1/users',userRouter);

export  {app};