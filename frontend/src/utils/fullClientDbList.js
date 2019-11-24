import query from './query'

const getClientDbList = (start, duration) => {
  return query('clientdblist', {start, duration})
}

// The ServerQuery returns maximum 200 entries in the clientdblist.
// This function collects all available entries in the client database list.
const getFullClientDbList = async () => {
  let fullClientDbList = []
  let start = 0
  let duration = 200

  try {
    while((await getClientDbList(start, duration)).length) {
      fullClientDbList.push(...(await getClientDbList(start, duration)))

      start += 200
      duration += 200
    }
  } catch(err) {
    throw err
  }

  return fullClientDbList
}

export default getFullClientDbList
