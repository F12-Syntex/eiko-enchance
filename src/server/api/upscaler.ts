export default defineEventHandler(async (event) => {
  const methodName = event.node.req.headers['x-method-name'] as string

  const methodMap: { [key: string]: Function } = {
    upscaleImage: upscaleImage,
  }

  if (methodName && methodName in methodMap) {
    return await methodMap[methodName]()
  } else {
    return { error: 'Unsupported method' }
  }
})

async function upscaleImage() {
    return { message: 'C:/Users/username/Documents/eiko/models' }
}