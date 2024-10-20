import axios from "axios"

export async function acceptReview(id: string, idSig: string): Promise<number> {
    const response = await axios.post(
        'http://localhost:5000/api/acceptReview',
        {id: id, idSig: idSig}
      )
    return response.status
}

export async function acceptCertificate(id: string, idSig: string): Promise<number> {
    const response = await axios.post(
        'http://localhost:5000/api/acceptCertificate',
        {id: id, idSig: idSig}
      )
    return response.status
}

interface ICertificatesQueue {
    _id: string,
    workerAddr: string,
    receiptDate: number
    imageLink: string,
    certificateId: string
}

interface IReviewsQueue {
    _id: string,
    reviewType: number,
    reviewFrom: string
    reviewTo: string,
    reviewText: string
}

export async function getUserInfo(user: string): Promise<any | null> {
    let response: any = null
    try {
        response = await axios.get(
            `http://localhost:5000/api/getUserInfo`,
            {params: { userAddress: user }}
          )
    } catch (error) {
        return null
    }

    return response.data.data
}

export async function getCertificatesQueue(): Promise<ICertificatesQueue[] | null> {
    let response: any = null
    try {
        response = await axios.get(
            'http://localhost:5000/api/getCertificatesQueue'
          )
    } catch (error) {
        return null
    }
    return response.data.data.certificates as ICertificatesQueue[]
}

export async function getReviewsQueue(): Promise<IReviewsQueue[] | null> {
    let response: any = null
    try {
        response = await axios.get(
            'http://localhost:5000/api/getReviewsQueue'
          )
    } catch (error) {
        return null
    }
    return response.data.data.reviews as IReviewsQueue[]
}