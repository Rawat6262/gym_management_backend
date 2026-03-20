const Payment = require("../models/Payment");
const Plan = require("../models/Plan");
const Member = require("../models/Member");

const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// exports.recordPayment = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { memberId, planId, paymentMethod, amount_paid } = req.body;

//     // --- Fetch plan and member ---
//     const plan = await Plan.findById(planId).session(session);
//     const meb = await Member.findById(memberId).session(session);

//     if (!plan) throw new Error("Plan not found");
//     if (!meb) throw new Error("Member not found");

//     // --- Validate amount_paid ---
//     const amountPaid = Number(amount_paid);
//     if (isNaN(amountPaid) || amountPaid < 0) {
//       throw new Error("Invalid amount_paid");
//     }

//     // --- Serial number ---
//     const count = await Payment.countDocuments().session(session);
//     const document_number = `Pro_fitness/${count + 1}/25-26`;

//     // --- Next due date ---
//     const nextDueDate = new Date();
//     nextDueDate.setDate(nextDueDate.getDate() + plan.duration);

//     // --- Pending calculation ---
//     const planPrice = plan.price;
//     const previousPending = meb.pending_amount || 0;

//     // New pending from this plan payment
//     const newPending = Math.max(0, planPrice - amountPaid);

//     // Total pending = leftover old pending + new pending from this plan
//     const totalPending = previousPending + newPending;

//     // --- Create Payment record ---
//     const payment = new Payment({
//       member: memberId,
//       plan: planId,
//       plan_name: plan.planname,
//       amount: amountPaid,
//       paymentMethod,
//       nextDueDate,
//       payment_serial_no: document_number,
//       pending: newPending,
//     });

//     const savedPayment = await payment.save({ session });

//     // --- Update Member ---
//     await Member.findByIdAndUpdate(
//       memberId,
//       {
//         membershipEndDate: nextDueDate,
//         plan: planId,
//         pending_amount: totalPending,
//       },
//       { session, new: true }
//     );

//     // --- Send Email ---
//     if (savedPayment) {
//       let transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       await transporter.sendMail({
//         from: '"Pro Fitness Gym" <pctebca592@gmail.com>',
//         to: meb.email,
//         subject: "Gym Payment Receipt - Pro Fitness Gym",
//         text: `Hello ${meb.name}, your payment of ₹${amountPaid} has been received.`,
//         html: `
//           <h2>Pro Fitness Gym Payment Receipt</h2>
//           <p>Hello ${meb.name},</p>
//           <p><strong>Plan:</strong> ${plan.planname}</p>
//           <p><strong>Plan Price:</strong> ₹${planPrice}</p>
//           <p><strong>Amount Paid:</strong> ₹${amountPaid}</p>
//           <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
//           <p><strong>Next Due Date:</strong> ${nextDueDate.toLocaleDateString()}</p>
//           ${totalPending > 0
//             ? `<p style="color:red;"><strong>⚠️ Pending Balance: ₹${totalPending}</strong></p>`
//             : `<p style="color:green;"><strong>✅ No pending dues!</strong></p>`
//           }
//         `,
//       });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       success: true,
//       message: "Payment recorded",
//       payment: savedPayment,
//       pending_summary: {
//         previous_pending: previousPending,
//         new_pending: newPending,
//         total_pending: totalPending,
//       },
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.recordPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
 
  try {
    const { memberId, planId, paymentMethod, amount_paid } = req.body;
 
    const plan = await Plan.findById(planId).session(session);
    const meb  = await Member.findById(memberId).session(session);
 
    if (!plan) throw new Error("Plan not found");
    if (!meb)  throw new Error("Member not found");
 
    const today = new Date();
 
    // ── RULE 1: Block payment if membership is still active AND no pending dues ──
    const isActive  = meb.membershipEndDate && new Date(meb.membershipEndDate) > today;
    const hasPending = (meb.pending_amount || 0) > 0;
 
    if (isActive && !hasPending) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        blocked: true,
        message: `Payment not allowed. ${meb.name}'s membership is active until ${new Date(meb.membershipEndDate).toLocaleDateString("en-IN")} with no pending dues.`,
        membershipEndDate: meb.membershipEndDate,
        pending_amount: meb.pending_amount
      });
    }
 
    // ── RULE 2: Warn if membership has expired (allow payment to renew) ──
    const isExpired = meb.membershipEndDate && new Date(meb.membershipEndDate) < today;
    // We don't block here — expired members SHOULD be able to pay to renew.
    // The warning is sent back in the response so the frontend can show an alert.
 
    // ── Validate amount ──
    const amountPaid = Number(amount_paid);
    if (isNaN(amountPaid) || amountPaid < 0) throw new Error("Invalid amount_paid");
 
    // ── Serial number ──
    const count = await Payment.countDocuments().session(session);
    const document_number = `Pro_fitness/${count + 1}/25-26`;
 
    // ── Next due date ──
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + plan.duration);
 
    // ── Pending calculation ──
    const planPrice       = plan.price;
    const previousPending = meb.pending_amount || 0;
    const newPending      = Math.max(0, planPrice - amountPaid);
    const totalPending    = previousPending + newPending;
 
    // ── Create Payment record ──
    const payment = new Payment({
      member:            memberId,
      plan:              planId,
      plan_name:         plan.planname,
      amount:            amountPaid,
      paymentMethod,
      nextDueDate,
      payment_serial_no: document_number,
      pending:           newPending,
    });
 
    const savedPayment = await payment.save({ session });
 
    // ── Update Member ──
    await Member.findByIdAndUpdate(
      memberId,
      {
        membershipEndDate: nextDueDate,
        plan:              planId,
        pending_amount:    totalPending,
      },
      { session, new: true }
    );
 
    // ── Send Email ──
    if (savedPayment) {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
      });
 
      await transporter.sendMail({
        from:    '"Pro Fitness Gym" <pctebca592@gmail.com>',
        to:      meb.email,
        subject: "Gym Payment Receipt - Pro Fitness Gym",
        html: `
          <h2>Pro Fitness Gym Payment Receipt</h2>
          <p>Hello ${meb.name},</p>
          <p><strong>Plan:</strong> ${plan.planname}</p>
          <p><strong>Plan Price:</strong> ₹${planPrice}</p>
          <p><strong>Amount Paid:</strong> ₹${amountPaid}</p>
          <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Next Due Date:</strong> ${nextDueDate.toLocaleDateString()}</p>
          ${totalPending > 0
            ? `<p style="color:red;"><strong>⚠️ Pending Balance: ₹${totalPending}</strong></p>`
            : `<p style="color:green;"><strong>✅ No pending dues!</strong></p>`
          }
        `,
      });
    }
 
    await session.commitTransaction();
    session.endSession();
 
    res.status(201).json({
      success: true,
      message: "Payment recorded",
      // ── If membership was expired, send a warning flag to frontend ──
      wasExpired: isExpired,
      expiredWarning: isExpired
        ? `⚠️ ${meb.name}'s membership had expired. It has been renewed until ${nextDueDate.toLocaleDateString("en-IN")}.`
        : null,
      payment: savedPayment,
      pending_summary: {
        previous_pending: previousPending,
        new_pending:      newPending,
        total_pending:    totalPending,
      },
    });
 
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getExpiredAlert = async (req, res) => {
  try {
    const today = new Date();
 
    const expired = await Member.find({
      membershipEndDate: { $lt: today }
    }).select("name phone email membershipEndDate pending_amount plan")
      .populate("plan", "planname price");
 
    const expiringSoon = await Member.find({
      membershipEndDate: {
        $gte: today,
        $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // next 7 days
      }
    }).select("name phone email membershipEndDate pending_amount plan")
      .populate("plan", "planname price");
 
    res.json({
      success: true,
      expired: {
        count:   expired.length,
        members: expired
      },
      expiringSoon: {
        count:   expiringSoon.length,
        members: expiringSoon
      }
    });
 
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.paymentHistory = async (req, res) => {

  try {

    const payments = await Payment.find({
      member: req.params.id
    })
      .populate("member")
      .populate("plan")
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      payments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
// const Payment = require("../models/Payment");

// const Payment = require("../models/Payment");

exports.getAllPayments = async (req, res) => {
  try {

    const payments = await Payment.find()
      .populate("member", "name")
      .populate("plan", "planname price")   // ✅ space-separated, correct field name
      .sort({ paymentDate: -1 });

    const formattedPayments = payments.map(p => ({
      _id: p._id,
      memberName: p.member?.name,
      planName: p.plan?.planname,           // ✅ was p.plan?.name — should be planname
      planPrice: p.plan?.price,             // ✅ now accessible
      amount: p.amount,
      pending: p.pending,
      paymentDate: p.paymentDate,
      method: p.paymentMethod,
      serial: p.payment_serial_no
    }));

    res.json({
      success: true,
      payments: formattedPayments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};