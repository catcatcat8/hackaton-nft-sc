export interface DATA {
  bigId: string
  dateOfHire?: string
  fullName?: string
  image?: string
  jobTitle?: string
  skills?: string
  type?: string

  reivewToFullName?: string
  reivewToImage?: string
  reviewFrom?: string
  reviewFromFullName?: string
  reviewFromImage?: string
  reviewTo?: string
  reviewText?: string
  reviewType?: number

  certId?: string
  imageCert?: string
  imageUser?: string
  walletAddr?: string
}

export interface UserProfile {
  fullName: string
  dateOfBirth: string
  avatar: string
  jobTitle: string
  skills: string
  image?: string
  dateOfHire?: string
}
