// Profit distribution logic for Car Showroom Management System

export interface CarInvestment {
  showroom_investment: number
  investors: Array<{
    id?: string
    name: string
    cnic: string
    investment_amount: number
  }>
  ownership_type: 'partially_owned' | 'fully_investor_owned'
  commission_type: 'flat' | 'percentage'
  commission_amount: number
  commission_percentage: number
}

export interface CarSaleData {
  purchase_price: number
  sold_price: number
  additional_expenses?: number // repairs, maintenance, etc.
  dealer_commission?: number
  investment: CarInvestment
}

export interface ProfitDistribution {
  total_profit: number
  total_investment: number
  showroom_share: {
    amount: number
    percentage: number
    source: 'ownership' | 'commission'
  }
  investor_shares: Array<{
    investor_id?: string
    investor_name: string
    investor_cnic: string
    investment_amount: number
    profit_share: number
    ownership_percentage: number
  }>
}

/**
 * Calculate total investment amount
 */
export function calculateTotalInvestment(investment: CarInvestment): number {
  const investorTotal = investment.investors.reduce((sum, inv) => sum + inv.investment_amount, 0)
  return investment.showroom_investment + investorTotal
}

/**
 * Calculate base profit before distribution
 */
export function calculateBaseProfit(saleData: CarSaleData): number {
  return saleData.sold_price - saleData.purchase_price - (saleData.additional_expenses || 0) - (saleData.dealer_commission || 0)
}

/**
 * Calculate profit distribution based on ownership structure
 */
export function calculateProfitDistribution(saleData: CarSaleData): ProfitDistribution {
  const baseProfit = calculateBaseProfit(saleData)
  const totalInvestment = calculateTotalInvestment(saleData.investment)
  
  if (saleData.investment.ownership_type === 'fully_investor_owned') {
    return calculateFullyInvestorOwnedDistribution(saleData, baseProfit, totalInvestment)
  } else {
    return calculatePartiallyOwnedDistribution(saleData, baseProfit, totalInvestment)
  }
}

/**
 * Calculate distribution for fully investor-owned cars
 */
function calculateFullyInvestorOwnedDistribution(
  saleData: CarSaleData, 
  baseProfit: number, 
  totalInvestment: number
): ProfitDistribution {
  let showroomCommission = 0
  
  // Calculate showroom commission
  if (saleData.investment.commission_type === 'flat') {
    showroomCommission = saleData.investment.commission_amount
  } else {
    showroomCommission = (baseProfit * saleData.investment.commission_percentage) / 100
  }
  
  // Remaining profit after commission goes to investors
  const remainingProfit = baseProfit - showroomCommission
  
  // Distribute remaining profit among investors based on their investment ratio
  const investor_shares = saleData.investment.investors.map(investor => {
    const ownershipPercentage = (investor.investment_amount / totalInvestment) * 100
    const profitShare = (remainingProfit * investor.investment_amount) / totalInvestment
    
    return {
      investor_id: investor.id,
      investor_name: investor.name,
      investor_cnic: investor.cnic,
      investment_amount: investor.investment_amount,
      profit_share: profitShare,
      ownership_percentage: ownershipPercentage,
    }
  })
  
  return {
    total_profit: baseProfit,
    total_investment: totalInvestment,
    showroom_share: {
      amount: showroomCommission,
      percentage: totalInvestment > 0 ? 0 : 100, // 0% ownership, only commission
      source: 'commission' as const,
    },
    investor_shares,
  }
}

/**
 * Calculate distribution for partially owned cars (showroom + investors)
 */
function calculatePartiallyOwnedDistribution(
  saleData: CarSaleData, 
  baseProfit: number, 
  totalInvestment: number
): ProfitDistribution {
  // Calculate ownership percentages
  const showroomOwnershipPercentage = totalInvestment > 0 ? (saleData.investment.showroom_investment / totalInvestment) * 100 : 100
  
  // Distribute profit based on investment ratio
  const showroomProfitShare = (baseProfit * saleData.investment.showroom_investment) / totalInvestment
  
  const investor_shares = saleData.investment.investors.map(investor => {
    const ownershipPercentage = (investor.investment_amount / totalInvestment) * 100
    const profitShare = (baseProfit * investor.investment_amount) / totalInvestment
    
    return {
      investor_id: investor.id,
      investor_name: investor.name,
      investor_cnic: investor.cnic,
      investment_amount: investor.investment_amount,
      profit_share: profitShare,
      ownership_percentage: ownershipPercentage,
    }
  })
  
  return {
    total_profit: baseProfit,
    total_investment: totalInvestment,
    showroom_share: {
      amount: showroomProfitShare,
      percentage: showroomOwnershipPercentage,
      source: 'ownership' as const,
    },
    investor_shares,
  }
}

/**
 * Calculate monthly profit summary for dashboard
 */
export interface MonthlyProfitSummary {
  total_cars_sold: number
  total_revenue: number
  total_profit: number
  showroom_profit: number
  investor_profit: number
  commission_earnings: number
  ownership_earnings: number
  average_profit_per_car: number
  roi_percentage: number
}

export function calculateMonthlyProfitSummary(
  soldCars: Array<{
    sale_data: CarSaleData
    sale_date: string
  }>,
  targetMonth: number,
  targetYear: number
): MonthlyProfitSummary {
  // Filter cars sold in the target month
  const monthCars = soldCars.filter(car => {
    const saleDate = new Date(car.sale_date)
    return saleDate.getMonth() === targetMonth && saleDate.getFullYear() === targetYear
  })
  
  let total_revenue = 0
  let total_profit = 0
  let showroom_profit = 0
  let investor_profit = 0
  let commission_earnings = 0
  let ownership_earnings = 0
  let total_investment = 0
  
  monthCars.forEach(car => {
    const distribution = calculateProfitDistribution(car.sale_data)
    
    total_revenue += car.sale_data.sold_price
    total_profit += distribution.total_profit
    total_investment += distribution.total_investment
    
    showroom_profit += distribution.showroom_share.amount
    
    if (distribution.showroom_share.source === 'commission') {
      commission_earnings += distribution.showroom_share.amount
    } else {
      ownership_earnings += distribution.showroom_share.amount
    }
    
    investor_profit += distribution.investor_shares.reduce((sum, inv) => sum + inv.profit_share, 0)
  })
  
  return {
    total_cars_sold: monthCars.length,
    total_revenue,
    total_profit,
    showroom_profit,
    investor_profit,
    commission_earnings,
    ownership_earnings,
    average_profit_per_car: monthCars.length > 0 ? total_profit / monthCars.length : 0,
    roi_percentage: total_investment > 0 ? (total_profit / total_investment) * 100 : 0,
  }
}

/**
 * Calculate investor performance summary
 */
export interface InvestorPerformanceSummary {
  investor_id?: string
  investor_name: string
  investor_cnic: string
  total_investments: number
  total_profit: number
  active_investments: number
  completed_investments: number
  roi_percentage: number
  average_profit_per_investment: number
}

export function calculateInvestorPerformance(
  investorId: string,
  allCars: Array<{
    investment: CarInvestment
    is_sold: boolean
    sale_data?: CarSaleData
  }>
): InvestorPerformanceSummary | null {
  // Find all cars this investor has invested in
  const investorCars = allCars.filter(car => 
    car.investment.investors.some(inv => inv.id === investorId)
  )
  
  if (investorCars.length === 0) return null
  
  // Get investor details from first car
  const investorDetails = investorCars[0].investment.investors.find(inv => inv.id === investorId)!
  
  let total_investments = 0
  let total_profit = 0
  let completed_investments = 0
  
  investorCars.forEach(car => {
    const investorData = car.investment.investors.find(inv => inv.id === investorId)!
    total_investments += investorData.investment_amount
    
    if (car.is_sold && car.sale_data) {
      completed_investments += 1
      const distribution = calculateProfitDistribution(car.sale_data)
      const investorShare = distribution.investor_shares.find(inv => inv.investor_id === investorId)
      if (investorShare) {
        total_profit += investorShare.profit_share
      }
    }
  })
  
  return {
    investor_id: investorId,
    investor_name: investorDetails.name,
    investor_cnic: investorDetails.cnic,
    total_investments,
    total_profit,
    active_investments: investorCars.length - completed_investments,
    completed_investments,
    roi_percentage: total_investments > 0 ? (total_profit / total_investments) * 100 : 0,
    average_profit_per_investment: completed_investments > 0 ? total_profit / completed_investments : 0,
  }
}
