import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '../ErrorState.vue'

describe('ErrorState', () => {
  it('renders default error message when no message prop is provided', () => {
    const wrapper = mount(ErrorState)
    expect(wrapper.text()).toContain('Something went wrong')
    expect(wrapper.text()).toContain('An unexpected error occurred. Please try again.')
  })

  it('renders custom message when provided', () => {
    const wrapper = mount(ErrorState, {
      props: { message: 'Failed to load sales data. Please refresh.' },
    })
    expect(wrapper.text()).toContain('Something went wrong')
    expect(wrapper.text()).toContain('Failed to load sales data. Please refresh.')
  })

  it('shows retry button by default', () => {
    const wrapper = mount(ErrorState)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Try Again')
  })

  it('hides retry button when showRetry is false', () => {
    const wrapper = mount(ErrorState, {
      props: { showRetry: false },
    })
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits retry event when retry button is clicked', async () => {
    const wrapper = mount(ErrorState)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('retry')).toBeTruthy()
    expect(wrapper.emitted('retry').length).toBe(1)
  })

  it('renders the warning icon', () => {
    const wrapper = mount(ErrorState)
    const iconContainer = wrapper.find('.rounded-2xl')
    expect(iconContainer.exists()).toBe(true)
    // Should have the danger-50 background class
    expect(iconContainer.classes()).toContain('bg-danger-50')
  })

  it('renders an svg icon', () => {
    const wrapper = mount(ErrorState)
    const svg = wrapper.find('svg')
    expect(svg.exists()).toBe(true)
  })
})
