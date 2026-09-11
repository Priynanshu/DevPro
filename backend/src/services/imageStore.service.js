const imagekit = require("../config/imagekit")

const uploadImage = async (fileBuffer, fileName, folder = "misc") => {
    const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: `/task-manager/${folder}`
    })

    return result.url
}

const deleteImage = async (fileId) => {
    await imagekit.deleteFile(fileId)
}

module.exports = { uploadImage, deleteImage }
