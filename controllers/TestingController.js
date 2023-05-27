const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const verifyRefreshToken = require("../functions/token/VerifyRefreshToken");
const signAccessToken = require("../functions/token/SignAccessToken");
const signRefreshToken = require("../functions/token/SignRefreshToken");
const addTaskToList = async (req, res) => {
  const { listId, name } = req.body;
  const authorId = req.user.id;

  try {
    const list1 = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        lists: {
          include: { tasks: true },
          where: { id: listId },
        },
      },
    });

    if (!list1.lists.length > 0) {
      return res.status(404).json({ error: "List not found" });
    }

    const task = await prisma.task.create({
      data: {
        name,
        list: { connect: { id: listId } },
      },
    });
    const existingTasks = list1.lists[0].tasks.map((task) => ({ id: task.id }));
    const updatedTasks = [...existingTasks, { id: task.id }];
    console.log("updated array : ");
    console.log(updatedTasks);
    if (list1.id) {
      console.log(list1.lists[0].id);

      const updatedList = await prisma.list.update({
        where: { id: listId },
        data: {
          tasks: {
            set: updatedTasks,
          },
        },
      });
    }

    res.status(200).json({ message: "Task added to the list", task });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateTaskInList = async (req, res) => {
  const { listId, taskId, name, completed } = req.body;
  const authorId = req.user.id;
  try {
    const list = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        lists: {
          include: { tasks: true },
          where: { id: listId },
        },
      },
    });

    if (!list.lists.length > 0) {
      return res.status(404).json({ error: "List not found" });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.listId !== listId) {
      return res.status(404).json({ error: "Task not found in the list" });
    }

    if (list.id) {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: { name, completed },
      });
    }

    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const addList = async (req, res) => {
  const { name } = req.body;
  const authorId = req.user.id;
  console.log("id is ", authorId);

  try {
    if (!name) {
      res.status(400).send("not name selected");
    }

    const list = await prisma.list.create({
      data: {
        name,
        author: { connect: { id: authorId } },
      },
    });

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
const getList = async (req, res) => {
  const authorId = req.user.id;
  const { listId } = req.body;
  try {
    if (!listId) {
      res.status(400).send("listId notFound");
    } else {
      const listContent = await prisma.user.findUnique({
        where: { id: authorId },
        select: {
          id: true,
          lists: {
            where: { id: listId },
          },
        },
      });

      console.log(listContent);
      res.json(listContent);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
};
const getUserLists = async (req, res) => {
  const authorId = req.user.id;

  try {
    if (authorId) {
      const lists = await prisma.list.findMany({
        where: { authorId: authorId },
        include: {
          tasks: {
            select: {
              name: true,
            },
            take: 3, // Limit the number of tasks to 5
            orderBy: { createdAt: "desc" }, // Order tasks by createdAt in descending order
          },
        },
      });

      console.log(lists);
      res.json(lists);
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("server error");
  }
};
const getUserInfo = async (req, res) => {
  const authorId = req.user.id;

  try {
    const userInfo = await prisma.user.findUnique({
      where: { id: authorId },
      select: {
        id: true,
        email: true,
        fullName: true,
        imgUri: true,
      },
    });

    res.json(userInfo);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("server error");
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.hello;
    console.log(refreshToken);
    if (!refreshToken) {
      res.status(400).send("badRequest");
    }
    const userPayload = await verifyRefreshToken.verifyRefreshToken(
      refreshToken
    );

    const accessToken = await signAccessToken.signRefreshToken(userPayload.id);
    const refToken = await signRefreshToken.signRefreshToken(userPayload.id);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addTaskToList,
  addList,
  getList,
  updateTaskInList,
  refreshToken,
  getUserLists,
  getUserInfo,
};
