import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KpiCard from '../KpiCard.vue'

describe('KpiCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 50000 },
    })
    expect(wrapper.text()).toContain('Revenue')
    expect(wrapper.text()).toContain('50.0K')
  })

  it('formats large values as millions', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 2500000 },
    })
    expect(wrapper.text()).toContain('2.5M')
  })

  it('formats large values as thousands', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 150000 },
    })
    expect(wrapper.text()).toContain('150.0K')
  })

  it('formats small values with locale string', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Items', value: 842 },
    })
    expect(wrapper.text()).toContain('842')
  })

  it('displays prefix before value', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 50000, prefix: '$' },
    })
    expect(wrapper.text()).toContain('$')
    expect(wrapper.text()).toContain('50.0K')
  })

  it('displays suffix after value', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Margin', value: 30.1, suffix: '%' },
    })
    expect(wrapper.text()).toContain('30.1%')
  })

  it('shows positive badge', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 100000, badge: 12.5 },
    })
    expect(wrapper.text()).toContain('12.5%')
    const badge = wrapper.find('.stat-badge')
    expect(badge.classes()).toContain('up')
  })

  it('shows negative badge with down class', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Orders', value: 500, badge: -3.2 },
    })
    expect(wrapper.text()).toContain('3.2%')
    const badge = wrapper.find('.stat-badge')
    expect(badge.classes()).toContain('down')
  })

  it('does not show badge when not provided', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 100000 },
    })
    expect(wrapper.find('.stat-badge').exists()).toBe(false)
  })

  it('shows subtext when provided', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 100000, subtext: 'Last 30 days' },
    })
    expect(wrapper.text()).toContain('Last 30 days')
  })

  it('shows skeleton when loading is true', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 100000, loading: true },
    })
    expect(wrapper.find('.skeleton').exists()).toBe(true)
    // Value should not be visible when loading
    expect(wrapper.text()).not.toContain('100K')
  })

  it('applies the type class to the card', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Profit', value: 50000, type: 'profit' },
    })
    expect(wrapper.classes()).toContain('kpi-card')
    expect(wrapper.classes()).toContain('profit')
  })

  it('renders string values directly without formatting', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Top Product', value: 'Laptop Pro' },
    })
    expect(wrapper.text()).toContain('Laptop Pro')
  })

  it('applies the correct icon background and color classes based on type', () => {
    const wrapper = mount(KpiCard, {
      props: { label: 'Revenue', value: 1000, type: 'revenue' },
    })
    const iconContainer = wrapper.find('.rounded-xl').element
    expect(iconContainer.className).toContain('bg-primary-50')
  })
})
