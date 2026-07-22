import TailorProfile from '../models/TailorProfile.js';
import Service from '../models/Service.js';

const withApprovalFlags = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.isApproved = obj.approvalStatus === 'approved';
  return obj;
};

export const getPending = async (req, res) => {
  try {
    const [tailors, services] = await Promise.all([
      TailorProfile.find({ approvalStatus: 'pending' })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 }),
      Service.find({ approvalStatus: 'pending' })
        .populate({
          path: 'tailor',
          populate: { path: 'user', select: 'name email' },
        })
        .sort({ createdAt: -1 }),
    ]);

    res.json({
      tailors: tailors.map((t) => {
        const obj = withApprovalFlags(t);
        obj.portfolioCount = (t.portfolio || []).length;
        return obj;
      }),
      services: services.map(withApprovalFlags),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load pending items' });
  }
};

export const approveTailor = async (req, res) => {
  try {
    const approved =
      req.body.approved === true ||
      req.body.isApproved === true ||
      req.body.status === 'approved' ||
      req.body.approvalStatus === 'approved' ||
      (req.body.approved === undefined &&
        req.body.isApproved === undefined &&
        req.body.status === undefined &&
        req.body.approvalStatus === undefined);

    const rejected =
      req.body.approved === false ||
      req.body.isApproved === false ||
      req.body.status === 'rejected' ||
      req.body.approvalStatus === 'rejected';

    const status = rejected ? 'rejected' : approved ? 'approved' : null;
    if (!status) {
      return res.status(400).json({ message: 'Provide approved true/false or status' });
    }

    const verification = req.body.verification || {};
    const checks = {
      shopLicense: Boolean(verification.shopLicense),
      identityProof: Boolean(verification.identityProof),
      portfolioReview: Boolean(verification.portfolioReview),
    };
    const hasVerification = Object.values(checks).some(Boolean);

    const update = {
      approvalStatus: status,
      ...(status === 'approved' ? { isActive: true } : { isActive: false }),
    };

    if (status === 'approved') {
      update.verificationChecks = checks;
      update.isVerifiedArtisan = hasVerification;
      if (hasVerification) {
        update.verifiedAt = new Date();
        update.verifiedBy = req.user._id;
      }
    } else {
      update.isVerifiedArtisan = false;
      update.verificationChecks = {
        shopLicense: false,
        identityProof: false,
        portfolioReview: false,
      };
      update.verifiedAt = null;
      update.verifiedBy = null;
    }

    const tailor = await TailorProfile.findByIdAndUpdate(req.params.id, update, {
      new: true,
    }).populate('user', 'name email phone');

    if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
    res.json({ tailor: withApprovalFlags(tailor) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update tailor approval' });
  }
};

export const verifyTailor = async (req, res) => {
  try {
    const tailor = await TailorProfile.findById(req.params.id);
    if (!tailor) return res.status(404).json({ message: 'Tailor not found' });
    if (tailor.approvalStatus !== 'approved') {
      return res.status(400).json({ message: 'Tailor must be approved before verification' });
    }

    const verification = req.body.verification || req.body;
    const checks = {
      shopLicense: Boolean(verification.shopLicense),
      identityProof: Boolean(verification.identityProof),
      portfolioReview: Boolean(verification.portfolioReview),
    };
    const hasVerification = Object.values(checks).some(Boolean);

    tailor.verificationChecks = checks;
    tailor.isVerifiedArtisan = hasVerification;
    tailor.verifiedAt = hasVerification ? new Date() : null;
    tailor.verifiedBy = hasVerification ? req.user._id : null;
    await tailor.save();

    const populated = await TailorProfile.findById(tailor._id).populate(
      'user',
      'name email phone'
    );
    res.json({ tailor: withApprovalFlags(populated) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update verification' });
  }
};

export const approveService = async (req, res) => {
  try {
    const approved =
      req.body.approved === true ||
      req.body.isApproved === true ||
      req.body.status === 'approved' ||
      req.body.approvalStatus === 'approved' ||
      (req.body.approved === undefined &&
        req.body.isApproved === undefined &&
        req.body.status === undefined &&
        req.body.approvalStatus === undefined);

    const rejected =
      req.body.approved === false ||
      req.body.isApproved === false ||
      req.body.status === 'rejected' ||
      req.body.approvalStatus === 'rejected';

    const status = rejected ? 'rejected' : approved ? 'approved' : null;
    if (!status) {
      return res.status(400).json({ message: 'Provide approved true/false or status' });
    }

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    ).populate({
      path: 'tailor',
      populate: { path: 'user', select: 'name email' },
    });

    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json({ service: withApprovalFlags(service) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update service approval' });
  }
};
