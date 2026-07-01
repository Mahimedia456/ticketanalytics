import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  updateUser,
} from "../services/userService.js";

export async function getUsers(req, res) {
  try {
    const users = await listUsers();

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load users",
    });
  }
}

export async function postUser(req, res) {
  try {
    const user = await createUser(req.body);

    return res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to create user",
    });
  }
}

export async function patchUser(req, res) {
  try {
    const user = await updateUser({
      id: req.params.id,
      ...req.body,
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update user",
    });
  }
}

export async function patchUserPassword(req, res) {
  try {
    const user = await resetUserPassword({
      id: req.params.id,
      password: req.body.password,
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to reset password",
    });
  }
}

export async function removeUser(req, res) {
  try {
    await deleteUser({ id: req.params.id });

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to delete user",
    });
  }
}