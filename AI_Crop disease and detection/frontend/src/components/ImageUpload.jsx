import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import { validateImageFile } from '../utils/validators'
import toast from 'react-hot-toast'

const ImageUpload = ({ onImageSelect, currentImage, maxSize = 10 * 1024 * 1024 }) => {
  const [preview, setPreview] = useState(currentImage || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    const validation = validateImageFile(file)
    
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error))
      return
    }

    if (file.size > maxSize) {
      toast.error(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
      onImageSelect(file)
    }
    reader.readAsDataURL(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onImageSelect(null)
  }

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <FiUpload className={`text-4xl mb-2 ${dragActive ? 'text-primary-600' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600 mb-1">
              {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <FiX />
          </button>
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm flex items-center">
            <FiImage className="mr-1" />
            Image Selected
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUpload

