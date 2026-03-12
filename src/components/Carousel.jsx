import { useState, useEffect } from 'react'

export function Carousel({ slides, autoPlay = true, interval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || isPaused) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, isPaused, interval, slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  if (!slides || slides.length === 0) return null

  return (
    <div 
      className="carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="carousel-track">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
          >
            <div className="carousel-content">
              {slide.icon && <div className="carousel-icon">{slide.icon}</div>}
              <h3 className="carousel-title">{slide.title}</h3>
              <p className="carousel-description">{slide.description}</p>
              <div className="carousel-buttons">
                {slide.buttons?.map((btn, btnIndex) => (
                  <a
                    key={btnIndex}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`carousel-btn ${btn.type || 'primary'}`}
                  >
                    {btn.icon && <span className="btn-icon">{btn.icon}</span>}
                    {btn.text}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button className="carousel-arrow prev" onClick={prevSlide} aria-label="Previous slide">
            ‹
          </button>
          <button className="carousel-arrow next" onClick={nextSlide} aria-label="Next slide">
            ›
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="carousel-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
