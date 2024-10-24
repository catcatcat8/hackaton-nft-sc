import axios from 'axios'
import { REACT_APP_BACKEND_BASE_URL } from './constants'

export async function acceptReview(id: string, idSig: string): Promise<number> {
  const response = await axios.post(
    `${REACT_APP_BACKEND_BASE_URL}/api/acceptReview`,
    {
      id: id,
      idSig: idSig,
    }
  )
  return response.status
}

export async function acceptCertificate(
  id: string,
  idSig: string
): Promise<number> {
  const response = await axios.post(
    `${REACT_APP_BACKEND_BASE_URL}/api/acceptCertificate`,
    { id: id, idSig: idSig }
  )
  return response.status
}

interface ICertificatesQueue {
  _id: string
  workerAddr: string
  receiptDate: number
  imageLink: string
  certificateId: string
}

interface IReviewsQueue {
  _id: string
  reviewType: number
  reviewFrom: string
  reviewTo: string
  reviewText: string
}

export async function getUserInfo(user: string): Promise<any | null> {
  let response: any = null
  try {
    response = await axios.get(
      `${REACT_APP_BACKEND_BASE_URL}/api/getUserInfo`,
      {
        params: { userAddress: user },
      }
    )
  } catch (error) {
    return null
  }

  return response.data.data
}

export async function getCertificatesQueue(): Promise<
  ICertificatesQueue[] | null
> {
  let response: any = null
  try {
    response = await axios.get(
      `${REACT_APP_BACKEND_BASE_URL}/api/getCertificatesQueue`
    )
  } catch (error) {
    return null
  }
  return response.data.data.certificates as ICertificatesQueue[]
}

export async function getReviewsQueue(): Promise<IReviewsQueue[] | null> {
  console.log('KEK', REACT_APP_BACKEND_BASE_URL)
  let response: any = null
  try {
    response = await axios.get(
      `${REACT_APP_BACKEND_BASE_URL}/api/getReviewsQueue`
    )
  } catch (error) {
    return null
  }
  return response.data.data.reviews as IReviewsQueue[]
}
