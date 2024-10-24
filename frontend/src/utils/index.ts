import { toast } from 'react-toastify'

export const handleCopyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      toast.success(`${text} Успешно скопирован в буфер обмена!`)
    },
    (err) => {
      toast.error(`Не получилось скопировать, вот ошибка: ' ${err}`)
    }
  )
}
