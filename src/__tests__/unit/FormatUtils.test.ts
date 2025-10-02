import { FormatUtils } from '../../utils/FormatUtils'

describe('FormatUtils', () => {
  describe('formatFullName', () => {
    it('should format full name correctly', () => {
      expect(FormatUtils.formatFullName('John', 'Doe')).toBe('John Doe')
      expect(FormatUtils.formatFullName('María', 'García')).toBe('María García')
    })

    it('should handle empty or whitespace names', () => {
      expect(FormatUtils.formatFullName('', 'Doe')).toBe('Doe')
      expect(FormatUtils.formatFullName('John', '')).toBe('John')
      expect(FormatUtils.formatFullName('  ', '  ')).toBe('')
      expect(FormatUtils.formatFullName('John  ', '  Doe')).toBe('John Doe')
    })

    it('should handle undefined names', () => {
      expect(FormatUtils.formatFullName(undefined as any, 'Doe')).toBe('Doe')
      expect(FormatUtils.formatFullName('John', undefined as any)).toBe('John')
    })
  })

  describe('formatPhone', () => {
    it('should format 10-digit phone numbers', () => {
      expect(FormatUtils.formatPhone('1234567890')).toBe('(123) 456-7890')
      expect(FormatUtils.formatPhone('9876543210')).toBe('(987) 654-3210')
    })

    it('should return original phone for non-10-digit numbers', () => {
      expect(FormatUtils.formatPhone('123456789')).toBe('123456789')
      expect(FormatUtils.formatPhone('12345678901')).toBe('12345678901')
      expect(FormatUtils.formatPhone('(123) 456-7890')).toBe('(123) 456-7890')
    })

    it('should handle phone numbers with existing formatting', () => {
      expect(FormatUtils.formatPhone('123-456-7890')).toBe('(123) 456-7890')
      expect(FormatUtils.formatPhone('123.456.7890')).toBe('(123) 456-7890')
    })
  })

  describe('formatAddress', () => {
    it('should format complete address', () => {
      const address = FormatUtils.formatAddress(
        '123 Main St',
        'Apt 4B',
        'New York',
        'NY',
        '10001',
        'USA'
      )
      expect(address).toBe('123 Main St, Apt 4B, New York, NY, 10001, USA')
    })

    it('should format partial address', () => {
      const address = FormatUtils.formatAddress(
        '123 Main St',
        undefined,
        'New York',
        'NY'
      )
      expect(address).toBe('123 Main St, New York, NY')
    })

    it('should handle empty address', () => {
      expect(FormatUtils.formatAddress()).toBe('')
      expect(FormatUtils.formatAddress('', '', '', '', '', '')).toBe('')
    })

    it('should trim whitespace from address parts', () => {
      const address = FormatUtils.formatAddress(
        '  123 Main St  ',
        '',
        '  New York  ',
        'NY  '
      )
      expect(address).toBe('123 Main St, New York, NY')
    })
  })

  describe('formatDateToISO', () => {
    it('should format Date object to ISO string', () => {
      const date = new Date('2023-12-25T10:30:00.000Z')
      expect(FormatUtils.formatDateToISO(date)).toBe('2023-12-25')
    })

    it('should format date string to ISO string', () => {
      expect(FormatUtils.formatDateToISO('2023-12-25')).toBe('2023-12-25')
      expect(FormatUtils.formatDateToISO('Dec 25, 2023')).toBe('2023-12-25')
    })

    it('should handle different date formats', () => {
      expect(FormatUtils.formatDateToISO('12/25/2023')).toBe('2023-12-25')
      expect(FormatUtils.formatDateToISO('2023-12-25T15:30:00')).toBe(
        '2023-12-25'
      )
    })
  })

  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(FormatUtils.capitalizeWords('hello world')).toBe('Hello World')
      expect(FormatUtils.capitalizeWords('JOHN DOE')).toBe('John Doe')
      expect(FormatUtils.capitalizeWords('maría josé')).toBe('María José')
    })

    it('should handle single words', () => {
      expect(FormatUtils.capitalizeWords('hello')).toBe('Hello')
      expect(FormatUtils.capitalizeWords('WORLD')).toBe('World')
    })

    it('should handle empty strings', () => {
      expect(FormatUtils.capitalizeWords('')).toBe('')
    })

    it('should handle special characters', () => {
      expect(FormatUtils.capitalizeWords("o'connor")).toBe("O'connor")
      expect(FormatUtils.capitalizeWords('jean-paul')).toBe('Jean-paul')
    })
  })
})
